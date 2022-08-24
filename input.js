function processKey(e) {
    // switch(e.code) {
    //     case "KeyW":
    //         //players[0].rb.velocity = addVector2(players[0].rb.velocity, rotateVector2(createVector2(0, -0.2), players[0].t.rotation));
    //         players[0].accelerate(accelerationSpeed);
    //         break;
    //     case "KeyS":
    //         //players[0].rb.velocity = addVector2(players[0].rb.velocity, rotateVector2(createVector2(0, 0.2), players[0].t.rotation));
    //         players[0].decelerate(accelerationSpeed);
    //         break;
    //     case "KeyA":
    //         //players[0].rb.rotationSpeed -= 0.2;
    //         players[0].turn(-turningSpeed);
    //         break;
    //     case "KeyD":
    //         //players[0].rb.rotationSpeed += 0.2;
    //         players[0].turn(turningSpeed);
    //         break;
    // }

    for(let p of players) {
        let keys = p.keys;
        switch(e.code) {
            case keys.up:
                p.accelerate(accelerationSpeed);
                break;
            case keys.down:
                p.decelerate(accelerationSpeed);
                break;
            case keys.left:
                p.turn(-turningSpeed);
                break;
            case keys.right:
                p.turn(turningSpeed);
                break;
            case keys.action:
                p.action();
                break;
        }
    }
}