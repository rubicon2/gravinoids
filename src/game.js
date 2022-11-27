require("./styles.css");

import * as Util from "./modules/util";
import * as V2 from "./modules/vectors";

import { setCanvasSize, createTri, drawModel } from "./modules/graphics";
import processKey from "./modules/input";

import Transform from "./modules/transform";
import Rigidbody from "./modules/rigidbody";
import Player from "./modules/player";

let canvas = null;
let ctx = null;
const scale = window.devicePixelRatio;
let center = V2.zero; 

const maxSpeed = 5;
const maxRotationSpeed = 10;
const defaultAccelerationSpeed = 0.2;
const defaultBrakingSpeed = 0.5;
const defaultTurningSpeed = 0.2;

let players = [];
let stars = [];
let rigidbodies = [];

let debug = true;
let debugPlayerColor = "white";
let timeToRender = 0;
let fps = 0;

let defaultKeys = [
    {
        up: "KeyW",
        left: "KeyA",
        down: "KeyS",
        right: "KeyD",
        action: "KeyE"
    },
    {
        up: "ArrowUp",
        left: "ArrowLeft",
        down: "ArrowDown",
        right: "ArrowRight",
        action: "ShiftRight"       
    }
]

let shipModels = [
    // Ship 1...
    [
        createTri(V2.create(-12, 12), V2.create(-6, -10), V2.create(0, 0), "yellow"),
        createTri(V2.create(0, 0), V2.create(6, -10), V2.create(12, 12), "red"),
        createTri(V2.create(-6, -10), V2.create(6, -10), V2.create(0, 0), "green"),
        createTri(V2.create(-6, -10), V2.create(6, -10), V2.create(0, -20), "blue")
    ],
    // Ship 2, etc.
    [
        createTri(V2.create(-12, 12), V2.create(0, -24), V2.create(0, 0), "yellow"),
        createTri(V2.create(12, 12), V2.create(0, -24), V2.create(0, 0), "red")
    ]
]

function createRGBA(r, g, b, a) {
    return {
        r: Util.clamp(0, 255, r),
        g: Util.clamp(0, 255, g),
        b: Util.clamp(0, 255, b),
        a: Util.clamp(0, 1, a),
        toString() {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    }
}

function drawModelCopies(transform, model) {
    let newTransform = Util.deepClone(transform);

    newTransform.v2_position.x += canvas.clientWidth;
    drawModel(ctx, newTransform, model);

    newTransform.v2_position.x -= canvas.clientWidth * 2;
    drawModel(ctx, newTransform, model);

    newTransform.v2_position.x += canvas.clientWidth;
    newTransform.v2_position.y -= canvas.clientHeight;
    drawModel(ctx, newTransform, model);

    newTransform.v2_position.y += canvas.clientHeight * 2;
    drawModel(ctx, newTransform, model);
}

function update() {
    for(let rb of Rigidbody.list) {
        rb.update();
        rb.transform.v2_position = V2.create(
            Util.loopNumber(0, canvas.clientWidth, rb.transform.v2_position.x), 
            Util.loopNumber(0, canvas.clientHeight, rb.transform.v2_position.y)
        );
    }
}

function createPlayers(playerCount) {
    playerCount = Math.min(playerCount, 4);
    players = [];
    // Not using break on purpose so it cascades down each case. 
    switch(playerCount) {
        case 4:
            new Player(createRGBA(0, 255, 0, 1), center.x * 0.5, center.y * 0.5, shipModels[1], defaultKeys[3]);
        case 3:
            new Player(createRGBA(0, 0, 255, 1), center.x * 1.5, center.y * 1.5, shipModels[0], defaultKeys[2]);
        case 2:
            new Player(createRGBA(255, 0, 0, 1), center.x * 1.5, center.y * 0.5, shipModels[1], defaultKeys[1]);
        default:
            new Player(createRGBA(255, 0, 255, 1), center.x * 0.5, center.y * 1.5, shipModels[0], defaultKeys[0]);
    }
}

function initialiseGameData(playerCount) {
    createPlayers(playerCount); 
}

function renderPlayerDebug(player) {

    let pos = player.t.v2_position;
    let f = player.t.forward;
    let v = player.rb.v2_velocity;

    ctx.strokeStyle = debugPlayerColor;
    ctx.fillStyle = debugPlayerColor;
    ctx.font = "24px Arial";

    // Draw forward direction.
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + f.x * scale * 40, pos.y + f.y * scale * 40);
    ctx.closePath();
    ctx.stroke();

    //ctx.moveTo(pos.x, pos.y);
    ctx.arc(pos.x, pos.y, scale * 25, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.save(); 
    ctx.translate(pos.x, pos.y);
    
    // Debug text. 
    ctx.fillText(`pos: ${Util.roundTo(pos.x, 0)}, ${Util.roundTo(pos.y, 0)}`, 40, -30);
    ctx.fillText(`rot: ${Util.roundTo(player.t.n_rotation, 0)}`, 40, 0);
    ctx.fillText(`f: ${Util.roundTo(f.x, 2)}, ${Util.roundTo(f.y, 2)}`, 40, 30);
    ctx.fillText(`v: ${Util.roundTo(v.x, 2)}, ${Util.roundTo(v.y, 2)}`, 40, 60);
    ctx.fillText(`rs: ${Util.roundTo(player.rb.n_rotationSpeed, 2)}`, 40, 90);

    ctx.restore();
}

function renderFPS() {
    ctx.save();
    ctx.strokeStyle = debugPlayerColor;
    ctx.fillStyle = debugPlayerColor;
    ctx.font = "24px Arial";

    ctx.fillText(`${fps}`, 10, 30);

    ctx.restore();
}

function updateFPS() {
    fps = Math.round(1000 / Math.abs(timeToRender));
}

function renderScene() {
    setCanvasSize(canvas, ctx, scale, canvas.clientWidth, canvas.clientHeight);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    for(let player of Player.list) {
        drawModel(ctx, player.t, player.model);
        drawModelCopies(player.t, player.model);
    }

    if(debug) {
        timeToRender -= new Date().getTime();
        renderFPS();
        for(let player of Player.list) {
            renderPlayerDebug(player);
        }
    }
}

function tick() {
    timeToRender = new Date().getTime();
    update();
    renderScene();
    requestAnimationFrame(tick);
}

function initialiseCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "renderCanvas";
    document.querySelector("body").appendChild(canvas);

    ctx = canvas.getContext("2d");
    center = V2.create(canvas.clientWidth / 2, canvas.clientHeight / 2); 
}

initialiseCanvas();
initialiseGameData(2);
requestAnimationFrame(tick);

window.addEventListener("keydown", function(e) {
    processKey(Player.list, e);
});

setInterval(() => {
    updateFPS();
}, 1000);
