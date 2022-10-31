const V2 = (function () {
    "use strict";

    const create = function(x, y) {
        return {
            x: x,
            y: y
        }
    };

    const up = create(0, -1);

    const down = create(0, 1);

    const left = create(-1, 0);

    const right = create(1, 0);

    const add = function(v1, v2) {
        return this.create(v1.x + v2.x, v1.y + v2.y);
    }

    const sub = function(v1, v2) {
        return this.create(v1.x - v2.x, v1.y - v2.y);
    };

    const magnitude = function(v) {
        return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    };

    const dot = function(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;    
    };

    const crossProduct = function(v1, v2) {
        return createVector2(v1.x * v2.y - v1.y * v2.x); 
    };

    const rotate = function(v, degrees) {
        let cos = Math.cos(degToRad(degrees));
        let sin = Math.sin(degToRad(degrees));
        return this.create(cos * v.x + -sin * v.y, sin * v.x + cos * v.y);
    };

    const degToRad = function(deg) {
        return deg * Math.PI / 180;
    };

    return {
        create: create,
        up: up,
        down: down,
        left: left,
        right: right,
        add: add,
        sub: sub,
        magnitude: magnitude,
        dot: dot,
        crossProduct: crossProduct,
        degToRad: degToRad,
        rotate: rotate
    }

})();