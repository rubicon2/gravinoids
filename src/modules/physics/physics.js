import { loopInt, lerp, mapToRange } from '../util';

export default function pointInPolyCollisionCheck(point, polygon) {
    // The polygon parameter is not like the rendering polygon - it's just an array of vertices
    let isColliding = false;
    const polygonLength = polygon.length;
    for (let i = 0; i < polygonLength; i += 1) {
        // Get a line of the polygon by grabbing two sequential vertices
        const otherVertexA = polygon[i];
        const otherVertexB = polygon[loopInt(0, polygonLength, i + 1)];
        // Calculate where we are on the x axis between vertexA and vertexB
        const whereOnX = mapToRange(
            point.x,
            otherVertexA.x,
            otherVertexB.x,
            0,
            1
        );
        if (whereOnX > 0 && whereOnX < 1) {
            const yCrossPoint = lerp(otherVertexA.y, otherVertexB.y, whereOnX);
            if (point.y < yCrossPoint) isColliding = !isColliding;
        }
    }
    return isColliding;
}
