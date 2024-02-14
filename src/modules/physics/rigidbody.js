import * as V2 from '../vectors';
import * as Util from '../util';
import { publish } from '../pubsub';
import pointInPolyCollisionCheck from './physics';
import Polygon from '../graphics/polygon';

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

    constructor(transform, collisionPolygon, collisionEnabled, physicsEnabled) {
        this.transform = transform;
        this.collisionPolygon = collisionPolygon;
        this.collisionEnabled = collisionEnabled;
        this.physicsEnabled = physicsEnabled;
        Rigidbody.list.push(this);

        publish('onNewRigidbody', this);
    }

    getWorldSpaceCollisionVertices() {
        return this.collisionPolygon
            .scaled(this.transform.v2_scale)
            .vertexArray.map((v) => V2.rotate(v, this.transform.n_rotation))
            .map((v) => V2.add(v, this.transform.v2_position));
    }

    getWorldSpaceCollisionPolygon() {
        return new Polygon(
            this.getWorldSpaceCollisionVertices(),
            'white',
            false
        );
    }

    checkCollisions() {
        // Filter out self! Get rigidbodies instead of polygons in case we need to tell the other rigidbody about the collision later
        // Can also filter out rigibodies that are too far away later (although the looping screen complicates this somewhat)
        const others = Rigidbody.list.filter((rb) => rb !== this);
        // THIS IS A LOT OF NESTED LOOPS. THINK OF THE BIG N!!! IS THERE ANY WAY AROUND THIS?? OR MAYBE COLLISION CHECKING IS JUST LABOURIOUS...
        let collisions = [];
        for (const other of others) {
            const otherVertices = other.getWorldSpaceCollisionVertices();
            for (let v of this.getWorldSpaceCollisionVertices()) {
                // If collision is occuring add info to list which will be used to resolve collisions
                if (pointInPolyCollisionCheck(v, otherVertices))
                    collisions.push({ location: v, collider: other });
            }
        }
        return collisions;
    }

    resolveCollisions(collisionArray) {
        for (let collision of collisionArray) {
            const location = collision.location;
            const collider = collision.collider;
            // Demo collision response
            this.v2_velocity.x *= -1;
            this.v2_velocity.y *= -1;
        }
    }

    update() {
        if (this.collisionEnabled) {
            const collisions = this.checkCollisions();
            if (this.physicsEnabled) {
                this.resolveCollisions(collisions);
            }
        }
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
