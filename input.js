function processKey(e) {
    switch(e.key) {
        case "w":
            players[0].rb.velocity.y -= 0.2;
            break;
        case "s":
            players[0].rb.velocity.y += 0.2;
            break;
        case "a":
            players[0].rb.velocity.x -= 0.2;
            break;
        case "d":
            players[0].rb.velocity.x += 0.2;
            break;
    }
}