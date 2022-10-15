const V2 = {
    create(x, y) {
        return {
            x: x,
            y: y
        }
    },
    up() {
        return this.create(0, -1);
    },
    down() {
        return this.create(0, 1);
    },
    left() {
        return this.create(-1, 0);
    }, 
    right() {
        return this.create(1, 0);
    },
    add(v1, v2) {
        return this.create(v1.x + v2.x, v1.y + v2.y);
    },
    sub(v1, v2) {
        return this.create(v1.x - v2.x, v1.y - v2.y);
    },
    magnitude(v) {
        return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    },
    dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;    
    },
    crossProduct(v1, v2) {
        return createVector2(v1.x * v2.y - v1.y * v2.x); 
    },
    normal(v1, v2) {
        console.log("Dunno lol");
    },
    rotate(v, degrees) {
        let cos = Math.cos(degToRad(degrees));
        let sin = Math.sin(degToRad(degrees));
        return this.create(cos * v.x + -sin * v.y, sin * v.x + cos * v.y);
    }
}