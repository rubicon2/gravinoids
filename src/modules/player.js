import Transform from "./transform";
import Rigidbody from "./rigidbody";
import * as V2 from "./vectors";
import { clamp } from "./util";

export default class Player {

    static list = [];

    color = undefined;
    mesh = undefined;
    keybindings = undefined;

    n_accelerationSpeed = 0.3;
    n_turningSpeed = 0.2;

    n_maxVelocity = 10;
    n_maxAngularVelocity = 6;

    constructor(color, x, y, mesh, keybindings) {
        this.t = new Transform(V2.create(x, y), 0, V2.one);
        this.rb = new Rigidbody(this.t, true);
        this.color = color;
        this.mesh = mesh;
        this.keys = keybindings;
        Player.list.push(this);
    }

    accelerate(speed) {
        this.rb.v2_velocity = V2.add(this.rb.v2_velocity, V2.rotate(V2.create(0, -speed), this.t.n_rotation));
        if (V2.magnitude(this.rb.v2_velocity) > this.n_maxVelocity) {
            this.rb.v2_velocity = V2.scale(V2.normalize(this.rb.v2_velocity), this.n_maxVelocity);
        }
    };

    decelerate(speed) {
        this.rb.v2_velocity = V2.add(this.rb.v2_velocity, V2.rotate(V2.create(0, speed), this.t.n_rotation));
        if (V2.magnitude(this.rb.v2_velocity) > this.n_maxVelocity) {
            this.rb.v2_velocity = V2.scale(V2.normalize(this.rb.v2_velocity), this.n_maxVelocity);
        }
    };

    turn(speed) {
        this.rb.n_rotationSpeed = clamp(-this.n_maxAngularVelocity, this.n_maxAngularVelocity, this.rb.n_rotationSpeed += speed);
    };
}