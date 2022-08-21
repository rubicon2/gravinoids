const canvas = document.querySelector("#renderCanvas");
const ctx = canvas.getContext("2d");
const scale = window.devicePixelRatio;
const center = createVector2(canvas.clientWidth / 2, canvas.clientHeight / 2); 

let players = [];
let rigidbodies = [];

let debug = true;
let debugPlayerColor = "white";

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

let ships = [
    [
        createVector2(-12, 12),
        createVector2(-6, -10),
        createVector2(0, -20),
        createVector2(6, -10),
        createVector2(12, 12),
        createVector2(0, 0)
    ]
]

function createTransform(x, y) {
    return t = { 
        position: createVector2(x, y),
        rotation: 0,
        forward() {
            return rotateVector2(createVector2(0, -1), this.rotation);
        }
    };
}

function createRigidbody() {
    let rb = {
        velocity: createVector2(0, 0),
        rotationSpeed: 0,
        acceleration: createVector2(0, 0),
        mass: 0, 
        bounciness: 0
    }
    // To ensure a rigibody is not created without being added to the list for processing, do it here. 
    rigidbodies.push(rb);
    return rb;
}

function createPlayer(color, x, y) {
    let newPlayer = {
        t: createTransform(x, y),
        rb: createRigidbody(),
        model: ships[0],
        color: color
    }
    return newPlayer;
}

function processRbs() {
    for(let rb in rigidbodies) {
        for (let other in rigidbodies) {
            if (other === rb) continue;
            // Need more info (i.e. bounding box) to check overlaps. Not just position! Duhhh.
            
        }
    }

    /* Newtonian Gravity
     * Smaller object acceleration = (G * Bigger object mass) / sqr(distance)
     */
}

function updatePosition(player) {
    player.rb.velocity = addVector2(player.rb.velocity, player.rb.acceleration);
    player.t.position = addVector2(player.t.position, player.rb.velocity);
    player.t.rotation = (player.t.rotation + player.rb.rotationSpeed) % 360;
    // Although modulus should only ever return POSITIVE NUMBERS as far as I am concerned, in JS it does not.
    // So, after % 360, this should never be any less than -360. Add 360 to neg angle, so angle range is 0 - 360 degrees.
    if (player.t.rotation < 0) {
        player.t.rotation += 360;
    }
}

function updatePositions() {
    for (let i = 0; i < players.length; i++) {
        updatePosition(players[i]);
    }
}

function createPlayers(playerCount) {
    playerCount = Math.min(playerCount, 4);
    players = [];
    // Not using break on purpose so it cascades down each case. 
    switch(playerCount) {
        case 4:
            players.push(createPlayer("green", center.x * 0.5, center.y * 0.5));
        case 3:
            players.push(createPlayer("blue", center.x * 1.5, center.y * 1.5));
        case 2:
            players.push(createPlayer("red", center.x * 1.5, center.y * 0.5));
        default:
            players.push(createPlayer("yellow", center.x * 0.5, center.y * 1.5));
    }
}

function initialiseGameData(playerCount) {
    createPlayers(playerCount); 
}

function renderPlayer(player) {

    let pos = player.t.position;
    let model = player.model;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(degToRad(player.t.rotation));
    ctx.fillStyle = player.color;

    ctx.beginPath();
    ctx.moveTo(player.model[0].x * scale, player.model[0].y * scale);
    for(let i = 1; i < player.model.length; i++) {
        let v = model[i];
        let x = v.x * scale;
        let y = v.y * scale;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function renderPlayerDebug(player) {

    let pos = player.t.position;
    let f = player.t.forward();
    let v = player.rb.velocity;

    ctx.strokeStyle = debugPlayerColor;
    ctx.fillStyle = debugPlayerColor;
    ctx.font = "24px Arial";

    // Draw forward direction.
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + f.x * 75, pos.y + f.y * 75);
    ctx.stroke();

    ctx.save(); 
    ctx.translate(pos.x, pos.y);
    
    // Debug text. 
    ctx.fillText(`pos: ${roundTo(pos.x, 0)}, ${roundTo(pos.y, 0)}`, 40, -30);
    ctx.fillText(`rot: ${roundTo(player.t.rotation, 0)}`, 40, 0);
    ctx.fillText(`f: ${roundTo(f.x, 2)}, ${roundTo(f.y, 2)}`, 40, 30);
    ctx.fillText(`v: ${roundTo(v.x, 2)}, ${roundTo(v.y, 2)}`, 40, 60);
    ctx.fillText(`rs: ${roundTo(player.rb.rotationSpeed, 2)}`, 40, 90);

    ctx.restore();
}

function renderScene() {
    setCanvasSize(canvas, ctx, scale, canvas.clientWidth, canvas.clientHeight);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    for(let player of players) {
        renderPlayer(player);
    }

    if(debug) {
        for(let player of players) {
            renderPlayerDebug(player);
        }
    }
}

function tick() {
    updatePositions();
    renderScene();
    requestAnimationFrame(tick);
}

window.addEventListener("keypress", processKey);
initialiseGameData(2);
requestAnimationFrame(tick);
// randomiseVector(players[0].rb.velocity, -1, 1);

// Get input 

// Process input 

// Run physics and collision detection

// Display on cavas