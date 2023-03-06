import * as V2 from "./vectors";

export default class Transform {

    static list = [];

    t_parent = null;
    v2_localPosition = V2.zero;
    n_localRotation = 0;
    v2_scale = V2.one;

    constructor(v2_localPosition, n_localRotation, v2_localScale, t_parent) {
        this.v2_localPosition = v2_localPosition;
        this.n_localRotation = n_localRotation;
        this.v2_localScale = v2_localScale;
        this.t_parent = t_parent;
        Transform.list.push(this);
    };

    get v2_position() {
        if (this.t_parent != null) {
            return V2.add(this.t_parent.v2_position, V2.rotate(this.v2_localPosition, this.t_parent.n_rotation));
        } else 
            return this.v2_localPosition;
    }

    get n_rotation() {
        if (this.t_parent != null)
            return this.t_parent.n_rotation + this.n_localRotation;
        else
            return this.n_localRotation;
    }

    get forward() {
        return V2.rotate(V2.up, this.n_rotation);
    };
}