import * as V2 from './../vectors';

export default class Polygon {
    constructor(vertexArray, color, isColorFill = true) {
        this.vertexArray = vertexArray;
        this.color = color;
        this.isColorFill = isColorFill;
    }

    scaled(v2_scale) {
        let scaledVertexArray = [];
        for (let v of this.vertexArray) {
            let scaledVertex = V2.create(v.x * v2_scale.x, v.y * v2_scale.y);
            scaledVertexArray.push(scaledVertex);
        }
        return new Polygon(scaledVertexArray, this.color, this.isColorFill);
    }
}
