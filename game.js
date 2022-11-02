const canvas = document.querySelector("#renderCanvas");
const ctx = canvas.getContext("2d");
const scale = window.devicePixelRatio;
const center = V2.create(canvas.clientWidth / 2, canvas.clientHeight / 2); 

const maxSpeed = 5;
const maxRotationSpeed = 10;
const accelerationSpeed = 0.2;
const brakingSpeed = 0.5;
const turningSpeed = 0.2;

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
    return rgba = {
        r: r,
        g: g,
        b: b,
        a: a,
        toString() {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    }
}

function createTransform(x, y) {
    return t = { 
        position: V2.create(x, y),
        rotation: 0,
        scale: V2.create(1, 1),
        forward() {
            return V2.rotate(V2.up, this.rotation);
        }
    };
}

function createRigidbody(transform, collisionEnabled) {
    let rb = {
        transform: transform,
        velocity: V2.create(0, 0),
        rotationSpeed: 0,
        acceleration: V2.create(0, 0),
        mass: 0, 
        bounciness: 0,
        collisionEnabled: collisionEnabled,
        update() {
            this.velocity = V2.add(this.velocity, this.acceleration);
            this.transform.position = V2.add(this.transform.position, this.velocity);
            this.transform.rotation = (this.transform.rotation + this.rotationSpeed) % 360;
            if (this.transform.rotation < 0) {
                this.transform.rotation += 360;
            }
        },
        createPlayer: createPlayer
    }
    // To ensure a rigibody is not created without being added to the list for processing, do it here. 
    rigidbodies.push(rb);
    return rb;
}

function createPlayer(color, x, y, model, keybindings) {
    return newPlayer = {
        t: createTransform(x, y),
        rb: createRigidbody(t, true),
        model: model,
        color: color,
        keys: keybindings,

        accelerate(speed) {
            this.rb.velocity = V2.add(this.rb.velocity, V2.rotate(V2.create(0, -speed), this.t.rotation));
            if (V2.magnitude(this.rb.velocity) > maxSpeed) {
                this.rb.velocity = V2.scale(V2.normalize(this.rb.velocity), maxSpeed);
            }
        },

        decelerate(speed) {
            this.rb.velocity = V2.add(this.rb.velocity, V2.rotate(V2.create(0, speed), this.t.rotation));
            if (V2.magnitude(this.rb.velocity) > maxSpeed) {
                this.rb.velocity = V2.scale(V2.normalize(this.rb.velocity), maxSpeed);
            }
        },

        turn(speed) {
            this.rb.rotationSpeed = Util.clamp(this.rb.rotationSpeed += speed, -maxRotationSpeed, maxRotationSpeed);
        },

        action() {
            // Do something!
        }
    }
}

function update() {
    for(let rb of rigidbodies) {
        rb.update();
        rb.transform.position = V2.create(
            Util.loopNumber(0, canvas.clientWidth, rb.transform.position.x), 
            Util.loopNumber(0, canvas.clientHeight, rb.transform.position.y)
        );
    }
}

function createPlayers(playerCount) {
    playerCount = Math.min(playerCount, 4);
    players = [];
    // Not using break on purpose so it cascades down each case. 
    switch(playerCount) {
        case 4:
            players.push(createPlayer(createRGBA(0, 255, 0, 1), center.x * 0.5, center.y * 0.5, shipModels[1], defaultKeys[3]));
        case 3:
            players.push(createPlayer(createRGBA(0, 0, 255, 1), center.x * 1.5, center.y * 1.5, shipModels[0], defaultKeys[2]));
        case 2:
            players.push(createPlayer(createRGBA(255, 0, 0, 1), center.x * 1.5, center.y * 0.5, shipModels[1], defaultKeys[1]));
        default:
            players.push(createPlayer(createRGBA(255, 0, 255, 1), center.x * 0.5, center.y * 1.5, shipModels[0], defaultKeys[0]));
    }
}

function initialiseGameData(playerCount) {
    createPlayers(playerCount); 
}

function renderPlayerDebug(player) {

    let pos = player.t.position;
    let f = player.t.forward();
    let v = player.rb.velocity;

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
    ctx.fillText(`rot: ${Util.roundTo(player.t.rotation, 0)}`, 40, 0);
    ctx.fillText(`f: ${Util.roundTo(f.x, 2)}, ${Util.roundTo(f.y, 2)}`, 40, 30);
    ctx.fillText(`v: ${Util.roundTo(v.x, 2)}, ${Util.roundTo(v.y, 2)}`, 40, 60);
    ctx.fillText(`rs: ${Util.roundTo(player.rb.rotationSpeed, 2)}`, 40, 90);

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

    for(let player of players) {
        drawModel(player.t, player.model);
    }

    if(debug) {
        // Really need to have this update every second or something, instead of constantly.
        timeToRender -= new Date().getTime();
        renderFPS();
        for(let player of players) {
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

window.addEventListener("keydown", processKey);
initialiseGameData(2);
requestAnimationFrame(tick);

setInterval(() => {
    updateFPS();
}, 1000);
