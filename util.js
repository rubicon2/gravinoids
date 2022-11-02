const Util = (function() {
    "use strict";

    const getRangedRandom = function(min, max) {
        let range = max - min; 
        return Math.random() * range + min;
    };
    
    const getRangedRandomInt = function(min, max) {
        return Math.round(getRangedRandom(min, max));
    };

    const clamp = function(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }
    
    const randomiseVector = function(v, min, max) {
        v.x = getRangedRandom(min, max);
        v.y = getRangedRandom(min, max);
    }
    
    const roundTo = function(float, digits) {
        digits = Math.pow(10, digits);
        float *= digits;
        float = Math.round(float);
        return float /= digits;
    }
    
    const shuffleArray = function(array) {
    
        let copy = array.slice();
        let shuffled = [];
    
        // Splice out elements in a random order until there are none left from the copy.
        while (copy.length > 0) {
            let randomIndex = getRangedRandomInt(0, copy.length - 1);
            shuffled[shuffled.length] = copy.splice(randomIndex, 1)[0];
        }
    
        return shuffled;
    };

    const lerp = function(min, max, t) {
        return min + (max - min) * t;
    }

    const inverseLerp = function(min, max, value) {
        return (value - min) / (max - min);
    }

    const loopNumber = function(min, max, value) {
        // "Normalize" position for lerp so it is always between min and max, 
        // and loops around by the appropriate amount as per above.
        let t = inverseLerp(min, max, value);
        t = t < 0 ? 1 + (t % 1): t % 1;
        return lerp(min, max, t);
    }

    return {
        getRangedRandom: getRangedRandom,
        getRangedRandomInt: getRangedRandomInt,
        clamp: clamp,
        randomiseVector: randomiseVector,
        roundTo: roundTo,
        shuffleArray: shuffleArray,
        lerp: lerp,
        inverseLerp: inverseLerp,
        loopNumber: loopNumber
    }

})();