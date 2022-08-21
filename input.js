function processKey(e) {
    switch(e.code) {
        case "KeyW":
            players[0].rb.velocity = addVector2(players[0].rb.velocity, rotateVector2(createVector2(0, -0.2), players[0].t.rotation));
            break;
        case "KeyS":
            players[0].rb.velocity = addVector2(players[0].rb.velocity, rotateVector2(createVector2(0, 0.2), players[0].t.rotation));
            break;
        case "KeyA":
            players[0].rb.rotationSpeed -= 0.2;
            break;
        case "KeyD":
            players[0].rb.rotationSpeed += 0.2;
            break;
    }
}