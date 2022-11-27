import Transform from "./transform";
import Rigidbody from "./rigidbody";
import * as V2 from "./vectors";
import { clamp } from "./util";

export default class Player {

    static list = [];

    color = undefined;
    model = undefined;
    keybindings = undefined;

    n_accelerationSpeed = 0.2;
    n_brakingSpeed = 0.2;
    n_turningSpeed = 0.2;

    constructor(color, x, y, model, keybindings) {
        this.t = new Transform(V2.create(x, y), 0, V2.one);
        this.rb = new Rigidbody(this.t, true);
        this.color = color;
        this.model = model;
        this.keys = keybindings;
        Player.list.push(this);
    }

    accelerate(speed) {
        this.rb.v2_velocity = V2.add(this.rb.v2_velocity, V2.rotate(V2.create(0, -speed), this.t.n_rotation));
        if (V2.magnitude(this.rb.v2_velocity) > 5) {
            this.rb.v2_velocity = V2.scale(V2.normalize(this.rb.v2_velocity), maxSpeed);
        }
    };

    decelerate(speed) {
        this.rb.v2_velocity = V2.add(this.rb.v2_velocity, V2.rotate(V2.create(0, speed), this.t.n_rotation));
        if (V2.magnitude(this.rb.v2_velocity) > 5) {
            this.rb.v2_velocity = V2.scale(V2.normalize(this.rb.v2_velocity), 5);
        }
    };

    turn(speed) {
        this.rb.n_rotationSpeed = clamp(-5, 5, this.rb.n_rotationSpeed += speed);
    };
}