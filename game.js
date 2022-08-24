const canvas = document.querySelector("#renderCanvas");
const ctx = canvas.getContext("2d");
const scale = window.devicePixelRatio;
const center = createVector2(canvas.clientWidth / 2, canvas.clientHeight / 2); 

const maxAcceleration = 5;
const accelerationSpeed = 0.2;
const brakingSpeed = 0.5;
const turningSpeed = 0.2;

let players = [];
let stars = [];
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

// let ships = [
//     [
//         createVector2(-12, 12),
//         createVector2(-6, -10),
//         createVector2(0, -20),
//         createVector2(6, -10),
//         createVector2(12, 12),
//         createVector2(0, 0)
//     ]
// ]

let shipModels = [
    // Ship 1...
    [
        createTri(createVector2(-12, 12), createVector2(-6, -10), createVector2(0, 0), "yellow"),
        createTri(createVector2(0, 0), createVector2(6, -10), createVector2(12, 12), "red"),
        createTri(createVector2(-6, -10), createVector2(6, -10), createVector2(0, 0), "green"),
        createTri(createVector2(-6, -10), createVector2(6, -10), createVector2(0, -20), "blue")
    ]
    // Ship 2, etc.
]

let starModels = [
    [
        createTri(createVector2(-1, -1), createVector2(1, -1), createVector2(0, 1))
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
        position: createVector2(x, y),
        rotation: 0,
        forward() {
            return rotateVector2(createVector2(0, -1), this.rotation);
        }
    };
}

function createRigidbody(transform, collisionEnabled) {
    let rb = {
        transform: transform,
        velocity: createVector2(0, 0),
        rotationSpeed: 0,
        acceleration: createVector2(0, 0),
        mass: 0, 
        bounciness: 0,
        collisionEnabled: collisionEnabled,
        update() {
            this.velocity = addVector2(this.velocity, this.acceleration);
            this.transform.position = addVector2(this.transform.position, this.velocity);
            this.transform.rotation = (this.transform.rotation + this.rotationSpeed) % 360;
            if (this.transform.rotation < 0) {
                this.transform.rotation += 360;
            }
        }
    }
    // To ensure a rigibody is not created without being added to the list for processing, do it here. 
    rigidbodies.push(rb);
    return rb;
}

function createStar(x, y, model, colorA, colorB) {
    return newStar = {
        t: createTransform(x, y),
        rb: createRigidbody(t, false),
        model: model,
        colorA: colorA,
        colorB: colorB
    }
}

function createPlayer(color, x, y, keybindings) {
    return newPlayer = {
        t: createTransform(x, y),
        rb: createRigidbody(t, true),
        model: shipModels[0],
        color: color,
        keys: keybindings,

        accelerate(speed) {
            this.rb.velocity = addVector2(this.rb.velocity, rotateVector2(createVector2(0, -speed), this.t.rotation));
        },

        decelerate(speed) {
            this.rb.velocity = addVector2(this.rb.velocity, rotateVector2(createVector2(0, speed), this.t.rotation));
        },

        turn(speed) {
            this.rb.rotationSpeed += speed;
        },

        action() {
            // Do something!
        }
    }
}

function update() {
    for(let rb of rigidbodies) {
        rb.update();
    }
}

function createStars(starCount) {
    for(let i = 0; i < starCount; i++) {
        let x = canvas.clientWidth * Math.random();
        let y = canvas.clientHeight * Math.random();
        let s = createStar(x, y, starModels[0], createRGBA(255 * Math.random(), 255 * Math.random(), 255, 1), createRGBA(255, 0, 0, 1));
        s.rb.velocity = createVector2((Math.random() * 2 - 1) * 0.01, (Math.random() * 2 - 1) * 0.01);
        s.rb.rotationSpeed = Math.random();
        stars.push(s);
    }
}

function createPlayers(playerCount) {
    playerCount = Math.min(playerCount, 4);
    players = [];
    // Not using break on purpose so it cascades down each case. 
    switch(playerCount) {
        case 4:
            players.push(createPlayer(createRGBA(0, 255, 0, 1), center.x * 0.5, center.y * 0.5, defaultKeys[3]));
        case 3:
            players.push(createPlayer(createRGBA(0, 0, 255, 1), center.x * 1.5, center.y * 1.5, defaultKeys[2]));
        case 2:
            players.push(createPlayer(createRGBA(255, 0, 0, 1), center.x * 1.5, center.y * 0.5, defaultKeys[1]));
        default:
            players.push(createPlayer(createRGBA(255, 0, 255, 1), center.x * 0.5, center.y * 1.5, defaultKeys[0]));
    }
}

function initialiseGameData(playerCount) {
    createPlayers(playerCount); 
}

function renderStar(star) {
    let pos = star.t.position;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(degToRad(star.t.rotation));

    for(let tri of star.model) {
        let color = star.colorA.toString();
        drawTri(tri, color);
    }

    ctx.restore();
}

function renderPlayer(player) {

    let pos = player.t.position;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(degToRad(player.t.rotation));

    let cos = Math.max(Math.cos(degToRad(player.t.rotation)), 0.45);
    let sin = Math.max(Math.sin(degToRad(player.t.rotation)), 0.45);
    let c = player.color;

    for(let tri of player.model) {
        let color = `rgb(${cos * c.r + sin * c.r}, ${cos * c.g + -sin * c.g}, ${cos * c.b + sin * c.b}, 1)`;
        drawTri(tri, color);
    }

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
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + f.x * 75, pos.y + f.y * 75);
    ctx.closePath();
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
    
    for(let star of stars) {
        renderStar(star);
    }

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
    update();
    renderScene();
    requestAnimationFrame(tick);
}

window.addEventListener("keydown", processKey);
initialiseGameData(2);
createStars(100);
requestAnimationFrame(tick);
