function createVector2(x, y) {
    return { 
        x: x,
        y: y
    }
}

function rotateVector2(v, deg) {
    let cos = Math.cos(degToRad(deg));
    let sin = Math.sin(degToRad(deg));
    return createVector2(cos * v.x + -sin * v.y, sin * v.x + cos * v.y);
}

function multiplyVector2(v, s) {
    return createVector2(v.x * s, v.y * s);
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