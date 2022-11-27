import * as V2 from "./vectors";

export default class Transform {

    static list = [];

    v2_position = V2.zero;
    n_rotation = 0;
    v2_scale = V2.one;

    constructor(v2_position, n_rotation, v2_scale) {
        this.v2_position = v2_position;
        this.n_rotation = n_rotation;
        this.v2_scale = v2_scale;
        Transform.list.push(this);
    };

    get forward() {
        return V2.rotate(V2.up, this.n_rotation);
    };
}