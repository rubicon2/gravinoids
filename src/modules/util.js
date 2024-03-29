const getRangedRandom = function (min, max) {
    let range = max - min;
    return Math.random() * range + min;
};

const getRangedRandomInt = function (min, max) {
    return Math.round(getRangedRandom(min, max));
};

const clamp = function (min, max, value) {
    return Math.max(Math.min(value, max), min);
};

const randomiseVector = function (v, min, max) {
    v.x = getRangedRandom(min, max);
    v.y = getRangedRandom(min, max);
};

const roundTo = function (float, digits) {
    digits = Math.pow(10, digits);
    float *= digits;
    float = Math.round(float);
    return (float /= digits);
};

const removeWhitespace = function (string) {
    let chars = string.toLowerCase().split('');
    return chars.filter((e) => e != ' ');
};

const shuffleArray = function (array) {
    let copy = array.slice();
    let shuffled = [];

    // Splice out elements in a random order until there are none left from the copy.
    while (copy.length > 0) {
        let randomIndex = getRangedRandomInt(0, copy.length - 1);
        shuffled[shuffled.length] = copy.splice(randomIndex, 1)[0];
    }

    return shuffled;
};

const lerp = function (min, max, t) {
    return min + (max - min) * t;
};

const inverseLerp = function (min, max, value) {
    return (value - min) / (max - min);
};

const loopNumber = function (min, max, value) {
    // "Normalize" position for lerp so it is always between min and max,
    // and loops around by the appropriate amount as per above.
    let t = inverseLerp(min, max, value);
    t = (1 + (t % 1)) % 1;
    return lerp(min, max, t);
};

const loopInt = function (min, max, value) {
    return Math.round(loopNumber(min, max, value));
};

const mapToRange = function (value, fromMin, fromMax, toMin, toMax) {
    // e.g. map a value from 20 - 50 to 0 - 1 scale.
    const t = inverseLerp(fromMin, fromMax, value);
    return lerp(toMin, toMax, t);
};

const deepClone = function (obj) {
    let clone = Object.create(Object.getPrototypeOf(obj));
    for (let property in obj) {
        let value = obj[property];
        if (typeof value === 'object') clone[property] = deepClone(value);
        else clone[property] = value;
    }
    return clone;
};

export {
    getRangedRandom,
    getRangedRandomInt,
    clamp,
    randomiseVector,
    roundTo,
    shuffleArray,
    lerp,
    inverseLerp,
    loopNumber,
    loopInt,
    mapToRange,
    deepClone,
};
