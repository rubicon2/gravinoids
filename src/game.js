require("./styles.css");

import * as Util from "./modules/util";
import * as V2 from "./modules/vectors";
import * as Gfx from "./modules/graphics";
import { publish } from "./modules/pubsub";

import processKey from "./modules/input";

import Rigidbody from "./modules/rigidbody";
import Player from "./modules/player";
import Transform from "./modules/transform";

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

let shipMeshes = [
    new Gfx.Mesh([new Gfx.Polygon([
        V2.create(-12, 12),
        V2.create(0, -24),
        V2.create(12, 12),
        V2.create(0, 0)
    ], "yellow")]),
    new Gfx.Mesh([
        new Gfx.Polygon([
        V2.create(-12, 12),
        V2.create(0, -24),
        V2.create(12, 12),
        V2.create(0, 0)
        ], "red"), 
        new Gfx.Polygon([
            V2.create(-12, 12),
            V2.create(0, -5),
            V2.create(12, 12),
            V2.create(0, 0)
        ], "orange")])
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

function update() {
    let canvasSize = Gfx.getCanvasSize();
    for(let rb of Rigidbody.list) {
        rb.update();
        // Loop position within play area
        rb.transform.v2_localPosition = V2.create(
            Util.loopNumber(0, canvasSize.x, rb.transform.v2_position.x), 
            Util.loopNumber(0, canvasSize.y, rb.transform.v2_position.y)
        );
    }
}

function createPlayers(playerCount) {
    let center = Gfx.getCenter();
    playerCount = Math.min(playerCount, 4);
    // Not using break on purpose so it cascades down each case. 
    switch(playerCount) {
        case 4:
            // New players are automatically added to static Player.list. 
            new Player(createRGBA(0, 255, 0, 1), center.x * 0.5, center.y * 0.5, shipMeshes[1], defaultKeys[3]);
        case 3:
            new Player(createRGBA(0, 0, 255, 1), center.x * 1.5, center.y * 1.5, shipMeshes[0], defaultKeys[2]);
        case 2:
            new Player(createRGBA(255, 0, 0, 1), center.x * 1.5, center.y * 0.5, shipMeshes[1], defaultKeys[1]);
        default:
            new Player(createRGBA(255, 0, 255, 1), center.x * 0.5, center.y * 1.5, shipMeshes[0], defaultKeys[0]);
    }
}

function initialiseGameData(playerCount) {
    createPlayers(playerCount); 
}

// function renderPlayerDebug(player) {

//     let pos = player.t.v2_position;
//     let f = player.t.forward;
//     let v = player.rb.v2_velocity;

//     ctx.strokeStyle = debugPlayerColor;
//     ctx.fillStyle = debugPlayerColor;
//     ctx.font = "24px Arial";

//     // Draw forward direction.
//     ctx.beginPath();
//     ctx.moveTo(pos.x, pos.y);
//     ctx.lineTo(pos.x + f.x * scale * 40, pos.y + f.y * scale * 40);
//     ctx.closePath();
//     ctx.stroke();

//     //ctx.moveTo(pos.x, pos.y);
//     ctx.arc(pos.x, pos.y, scale * 25, 0, 2 * Math.PI);
//     ctx.stroke();

//     ctx.save(); 
//     ctx.translate(pos.x, pos.y);
    
//     // Debug text. 
//     ctx.fillText(`pos: ${Util.roundTo(pos.x, 0)}, ${Util.roundTo(pos.y, 0)}`, 40, -30);
//     ctx.fillText(`rot: ${Util.roundTo(player.t.n_rotation, 0)}`, 40, 0);
//     ctx.fillText(`f: ${Util.roundTo(f.x, 2)}, ${Util.roundTo(f.y, 2)}`, 40, 30);
//     ctx.fillText(`v: ${Util.roundTo(v.x, 2)}, ${Util.roundTo(v.y, 2)}`, 40, 60);
//     ctx.fillText(`rs: ${Util.roundTo(player.rb.n_rotationSpeed, 2)}`, 40, 90);

//     ctx.restore();
// }

// function renderFPS() {
//     ctx.save();
//     ctx.strokeStyle = debugPlayerColor;
//     ctx.fillStyle = debugPlayerColor;
//     ctx.font = "24px Arial";

//     ctx.fillText(`${fps}`, 10, 30);

//     ctx.restore();
// }

function tick() {
    publish('onTickStart');

    update();
    Gfx.renderScene2D();
    requestAnimationFrame(tick);

    publish('onTickEnd');
}

Gfx.createCanvas();
initialiseGameData(2);
requestAnimationFrame(tick);

window.addEventListener("keydown", function(e) {
    processKey(Player.list, e);
});

Gfx.addToRenderList(new Gfx.RenderItem(Player.list[0].t, { mesh: Player.list[0].mesh }))
Gfx.addToRenderList(new Gfx.RenderItem(Player.list[1].t, { mesh: Player.list[1].mesh }))

let t_debugPanel = new Transform(V2.create(50, 0), 0, V2.one, Player.list[0].t);
t_debugPanel.freeze_rotation = true;
Gfx.addToRenderList(new Gfx.RenderItem(new Transform(V2.zero, 0, V2.one, t_debugPanel), { text: () => { return new Date().getTime(); } }, Gfx.layers.debug));
Gfx.addToRenderList(new Gfx.RenderItem(new Transform(V2.create(0, 25), 45, V2.one, t_debugPanel), { text: "It's a turnip!" }, Gfx.layers.debug))