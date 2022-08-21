function processKey(e) {
    switch(e.code) {
        case "KeyW":
            players[0].rb.velocity.y -= 0.2;
            break;
        case "KeyS":
            players[0].rb.velocity.y += 0.2;
            break;
        case "KeyA":
            players[0].rb.rotationSpeed -= 0.2;
            break;
        case "KeyD":
            players[0].rb.rotationSpeed += 0.2;
            break;
    }
}