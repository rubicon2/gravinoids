import * as V2 from "./vectors";
import * as Util from "./util";

export default class Rigidbody {

    static list = [];

    transform = undefined;
    v2_velocity = V2.zero;
    n_rotationSpeed = 0;
    v2_acceleration = V2.zero;

    mass = 0;
    bounciness = 0;
    collisionEnabled = true;

    constructor(transform, collisionEnabled) {
        this.transform = transform;
        this.collisionEnabled = collisionEnabled;
        Rigidbody.list.push(this);
    };

    update() {
        this.v2_velocity = V2.add(this.v2_velocity, this.v2_acceleration);
        this.transform.v2_localPosition = V2.add(this.transform.v2_position, this.v2_velocity);
        this.transform.n_localRotation = Util.loopNumber(0, 360, this.transform.n_rotation + this.n_rotationSpeed);
    };
}