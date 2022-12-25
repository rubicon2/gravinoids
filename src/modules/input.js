import { getDelta } from "./graphics";

export default function(players, e) {
    for(let p of players) {
        let keys = p.keys;
        switch(e.code) {
            case keys.up:
                p.accelerate(p.n_accelerationSpeed);
                break;
            case keys.down:
                p.decelerate(p.n_accelerationSpeed);
                break;
            case keys.left:
                p.turn(-p.n_turningSpeed);
                break;
            case keys.right:
                p.turn(p.n_turningSpeed);
                break;
            case keys.action:
                p.action();
                break;
        }
    }
}