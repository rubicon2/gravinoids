function createVector2(x, y) {
    return { 
        x: x,
        y: y
    }
}

function addVector2(v1, v2) {
    return createVector2(v1.x + v2.x, v1.y + v2.y);
}

function subVector2(v1, v2) {
    return createVector2(v1.x - v2.x, v1.y - v2.y);
}

function getMagitude(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

// Check this works!
function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function crossProduct(v1, v2) {
    return createVector2(v1.x * v2.y - v1.y * v2.x); 
}

function getNormal(v1, v2) {

}