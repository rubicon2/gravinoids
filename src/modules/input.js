// When a binding is created, keyboard code will be extracted and set here
// corresponding value will be an array of the input sequences that are interested in that keycode
import { loopInt } from "./util";

class InputController {

    // Points the way for the key event to the correct binding group
    static boundInputs = new Map(); 
    // E.g. each player has their own group
    static bindingGroups = new Map();

    static addBindingGroup(groupName, isActive, inputSequences) {
        if (!this.bindingGroups.has(groupName)) {
            this.bindingGroups.set(groupName, { isActive, inputSequences });
            inputSequences.forEach(inputSeq => {
                let inputs = inputSeq.getAllInputs();
                inputs.forEach(input => {
                    if (!this.boundInputs.has(input)) {
                        this.boundInputs.set(input, groupName);
                    } else {
                        console.warn(`Attempted to overwrite ${input}`);
                    }
                });
            });
        } else {
            console.warn(`Attempted to overwrite binding group ${groupName}`);
        }
    } 

    static createBoundInputKey(event) {
        return `${event.type} ${event.code}`;
    }

    static #getAssociatedInputGroup(event) {
        let groupName = this.boundInputs.get(this.createBoundInputKey(event));
        return this.bindingGroups.get(groupName);  
    }

    static handleKeyDown(event) {
        if (this.boundInputs.has(this.createBoundInputKey(event))) {
            for (let inputSequence of this.#getAssociatedInputGroup(event).inputSequences) {
                inputSequence.handleInput(event);
            }
        }
    }

    static handleKeyUp(event) {
        if (this.boundInputs.has(this.createBoundInputKey(event))) {
            for (let inputSequence of this.#getAssociatedInputGroup(event).inputSequences) {
                inputSequence.handleInput(event);
            }
        }
    }

}

class InputSequence {

    #inputStage = 0;

    // inputs e.g. an array of key events
    // onInputBreak e.g. a function triggered when sequence fails
    constructor(inputs, onInputBreak = null) {
        this.inputs = inputs;
        this.onInputBreak = onInputBreak;
    }

    handleInput(event) {
        let code = event.code;
        let nextInput = this.inputs[this.#inputStage];
        if (nextInput.code === code) {
            if (nextInput.action)
                nextInput.action();
            this.#inputStage = loopInt(0, this.inputs.length, this.#inputStage + 1);
        } else {
            this.#inputStage = 0;
        }
    }

    getAllInputs() {
        return this.inputs.map(e => InputController.createBoundInputKey(e));
    }
}

class KeyEvent {
    // type e.g. keydown, hold, keyup
    // action e.g. a function to call when the key event happens
    constructor(type, code, action = null) {
        this.type = type;
        this.code = code;
        this.action = action;
    }
}

export {
    InputController,
    InputSequence,
    KeyEvent
}