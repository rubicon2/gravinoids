function getRangedRandom(min, max) {
    let range = max - min; 
    return Math.random() * range + min;
}

function getRangedRandomInt(min, max) {
    return Math.round(getRangedRandom(min, max));
}

function randomiseVector(v, min, max) {
    v.x = getRangedRandom(min, max);
    v.y = getRangedRandom(min, max);
}

function shuffleArray(array) {

    let copy = array.slice();
    let shuffled = [];

    // Splice out elements in a random order until there are none left from the copy.
    while (copy.length > 0) {
        let randomIndex = getRangedRandomInt(0, copy.length - 1);
        shuffled[shuffled.length] = copy.splice(randomIndex, 1)[0];
    }

    return shuffled;
}