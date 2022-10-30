const Util = (function() {
    "use strict";

    const getRangedRandom = function(min, max) {
        let range = max - min; 
        return Math.random() * range + min;
    };
    
    const getRangedRandomInt = function(min, max) {
        return Math.round(getRangedRandom(min, max));
    };
    
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
    
    const degToRad = function(deg) {
        return deg * Math.PI / 180;
    };

    return {
        getRangedRandom: getRangedRandom,
        getRangedRandomInt: getRangedRandomInt,
        randomiseVector: randomiseVector,
        roundTo: roundTo,
        shuffleArray: shuffleArray,
        degToRad: degToRad
    }

})();