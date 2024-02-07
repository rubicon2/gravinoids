export default class Mesh {
    constructor(polygons) {
        this.polygons = polygons;
    }

    scaled(v2_scale) {
        let scaledPolygons = [];
        // Why is polygons not iterable?
        for (let p of this.polygons) {
            scaledPolygons.push(p.scaled(v2_scale));
        }
        return new Mesh(scaledPolygons);
    }
}
