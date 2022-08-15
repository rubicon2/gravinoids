const canvas = document.querySelector("#renderCanvas");
const ctx = canvas.getContext("2d");
const scale = window.devicePixelRatio;
const center = createVector2(canvas.clientWidth / 2, canvas.clientHeight / 2); 

let players = [];
let rigidbodies = [];

function calculateForward(transform) {
    // How to do that? 
    // Use transform's rotation to create a vector direction.
    // 0 = up
    // 90 = right
    // 180 = down
    // 270 = left 
    // Generate a unit vector representing the direction. 
}

function createTransform(x, y) {
    return t = { 
        position: createVector2(x, y),
        rotation: 0,
        forward: createVector2(0, 0) 
    };
}

function createRigidbody(vx, vy, ax, ay, rot) {
    let rb = {
        velocity: createVector2(vx, vy),
        rotationSpeed: rot,
        acceleration: createVector2(ax, ay),
        mass: 0, 
        bounciness: 0
    }
    // To ensure a rigibody is not created without being added to the list for processing, do it here. 
    rigidbodies.push(rb);
    return rb;
}

function createPlayer(color, x, y, ax, ay, rotationSpeed) {
    let newPlayer = {
        t: createTransform(x, y),
        rb: createRigidbody(0, 0, ax, ay, rotationSpeed),
        model: [createVector2(-12, -12),
                createVector2(-6, 10),
                createVector2(0, 20),
                createVector2(6, 10),
                createVector2(12, -12),
                createVector2(0, 0)],
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
    player.rb.velocity.x += player.rb.acceleration.x;
    player.rb.velocity.y += player.rb.acceleration.y;
    player.t.position.x += player.rb.velocity.x;
    player.t.position.y += player.rb.velocity.y;
    player.t.rotation = (player.t.rotation + player.rb.rotationSpeed) % 360;
}

function updatePositions() {
    for (let i = 0; i < players.length; i++) {
        updatePosition(players[i]);
    }
}

function createPlayers(playerCount) {
    // for(let i = 0; i < playerCount; i++) {
    //     let newPlayer = createPlayer();
    // }

    players = [];

    players.push(createPlayer("red", center.x * 0.5, center.y, 0, 0, 1));
    players.push(createPlayer("blue", center.x * 1.5, center.y, 0, 0, 2));
    // players.push(createPlayer("green"));
    // players.push(createPlayer("yellow"));
}

function initialiseGameData(playerCount) {
    createPlayers(playerCount); 
}

function renderPlayer(player) {

    ctx.fillStyle = player.color;
    let pos = player.t.position;
    let model = player.model;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(player.t.rotation * Math.PI / 180);

    ctx.beginPath();
    // ctx.moveTo(pos.x + player.model[0].x * scale, pos.y + player.model[0].y * scale);
    // for(let i = 1; i < player.model.length; i++) {
    //     let v = model[i];
    //     let x = pos.x + v.x * scale;
    //     let y = pos.y + v.y * scale;
    //     ctx.lineTo(x, y);
    // }
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

function renderScene() {
    setCanvasSize(canvas, ctx, scale, canvas.clientWidth, canvas.clientHeight);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    for(let player of players) {
        renderPlayer(player);
    }
}

function tick() {
    updatePositions();
    renderScene();
    requestAnimationFrame(tick);
}

window.addEventListener("keypress", processKey);
initialiseGameData(1);
requestAnimationFrame(tick);
// randomiseVector(players[0].rb.velocity, -1, 1);

// Get input 

// Process input 

// Run physics and collision detection

// Display on cavas