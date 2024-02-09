import * as V2 from './vectors';
import * as Util from './util';
import { publish } from './pubsub';

export default class Rigidbody {
    static list = [];

    transform = undefined;
    collisionMesh = undefined;
    v2_velocity = V2.zero;
    n_rotationSpeed = 0;
    v2_acceleration = V2.zero;

    mass = 0;
    bounciness = 0;
    collisionEnabled = true;

    constructor(transform, collisionMesh, collisionEnabled) {
        this.transform = transform;
        this.collisionMesh = collisionMesh;
        this.collisionEnabled = collisionEnabled;
        Rigidbody.list.push(this);

        publish('onNewRigidbody', this);
    }

    getWorldSpaceCollisionVertices() {
        return this.collisionMesh
            .scaled(this.transform.v2_scale)
            .getVertices()
            .map((v) => V2.rotate(v, this.transform.n_rotation))
            .map((v) => V2.add(v, this.transform.v2_position));
    }

    update() {
        this.v2_velocity = V2.add(this.v2_velocity, this.v2_acceleration);
        this.transform.v2_localPosition = V2.add(
            this.transform.v2_position,
            this.v2_velocity
        );
        this.transform.n_localRotation = Util.loopNumber(
            0,
            360,
            this.transform.n_rotation + this.n_rotationSpeed
        );
    }
}
