let bindingSets = new Map();
// inputSequence: { actions: [functions], userInputs: "" }
let bindings = new Map();

let activeBindingSet = null;

// User input sequences are stored in here, arranged by what binding they relate to.
// Once input sequence matches a binding, it will trigger the function relating to it!
let userInputs = [];

// Want a flexible system like this, kind of like a regex... 
// Press F twice, then press either A, B or C simultaneously with E, F or G.
// KeyF{2} > ([KeyA|KeyB|KeyC] + [KeyE|KeyF|KeyG])
// Could use inputs to generate a regex like this, and match the result with the regex strings assigned to each binding? 
// But with multiple players, would be messy. 
// When input happens, filter so it only applies to active binding sets, on the appropriate player, on the relevant binding.
function addBindingSet(name, bindings) {
    if (bindingSets.has(name)) {
        console.info(`Binding set overwritten: ${name}`);
    } else {
        console.info(`New binding set added: ${name}`);
    }
    bindingSets.set(bindings);
}

function addBinding(inputSequence, fn) {
    if (bindings.has(inputSequence)) {
        console.info(`Function added to existing binding actions: ${inputSequence} \n ${fn}`);
        bindings.get(inputSequence).actions.push(fn);
    } else {
        console.info(`New action added to binding: ${inputSequence} \n ${fn}`);
        bindings.set(inputSequence, { actions: [fn] });
    }
}

function handleKeyPress(event) {
    let code = event.code;
    if (bindings.has(code)) {
        // Get paired functions and execute
        bindings.get(code).actions.forEach(fn => {
            fn();
        });
    }
    // Add onto appropriate string, also add the current time so we know the delay between inputs
    userInputs.push({ code, time: new Date().getTime()})


} 

function handleKeyUp(event) {
    // Remove from list
    userInputs = userInputs.filter((input) => {
        return input.code != event.code;
    });
    console.log(userInputs);
}

export {
    addBindingSet,
    addBinding,
    handleKeyPress,
    handleKeyUp
}