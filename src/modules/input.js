// When a binding is created, keyboard code will be extracted and set here
// corresponding value will be an array of the input sequences that are interested in that keycode
import { loopInt } from './util';

const slowInputTimeout = 750;
const standardInputTimeout = 600;
const fastInputTimeout = 500;

class InputController {
    // Points the way for the key event to the correct binding group
    static boundInputs = new Map();
    // E.g. each player has their own group
    static bindingGroups = new Map();

    static addBindingGroup(groupName, isActive, inputSequences) {
        if (!this.bindingGroups.has(groupName)) {
            this.bindingGroups.set(groupName, { isActive, inputSequences });
            inputSequences.forEach((inputSeq) => {
                let inputKeys = inputSeq.getAllInputKeys();
                inputKeys.forEach((inputKey) => {
                    if (!this.boundInputs.has(inputKey)) {
                        this.boundInputs.set(inputKey, groupName);
                    } else {
                        console.warn(`Attempted to overwrite ${inputKey}`);
                    }
                });
            });
        } else {
            console.warn(`Attempted to overwrite binding group ${groupName}`);
        }
    }

    static createBoundInputKey(type, code) {
        return `${type} ${code}`;
    }

    static #getAssociatedInputGroup(event) {
        let groupName = this.boundInputs.get(
            this.createBoundInputKey(event.type, event.code)
        );
        return this.bindingGroups.get(groupName);
    }

    static handleKeyDown(event) {
        if (
            this.boundInputs.has(
                this.createBoundInputKey(event.type, event.code)
            )
        ) {
            for (let inputSequence of this.#getAssociatedInputGroup(event)
                .inputSequences) {
                inputSequence.handleInput(event);
            }
        }
    }

    static handleKeyUp(event) {
        if (
            this.boundInputs.has(
                this.createBoundInputKey(event.type, event.coded)
            )
        ) {
            for (let inputSequence of this.#getAssociatedInputGroup(event)
                .inputSequences) {
                inputSequence.handleInput(event);
            }
        }
    }
}

class InputSequence {
    #inputStage = 0;
    #timeout = null;

    // inputs e.g. an array of key events
    // onInputBreak e.g. a function triggered when sequence fails
    constructor(inputs, onInputBreak = null) {
        this.inputs = inputs;
        this.onInputBreak = onInputBreak;
    }

    handleInput(event) {
        let code = event.code;
        let nextInput = this.inputs[this.#inputStage];
        // If input matches expected next input in sequence
        if (nextInput.codeSet.has(code)) {
            if (nextInput.action) nextInput.action();
            this.#inputStage = loopInt(
                0,
                this.inputs.length,
                this.#inputStage + 1
            );
            // If next input not detected before timeout triggers, sequence will be reset
            this.#setNewInputTimeout(nextInput.timeout);
            // If user is pressing the first key in sequence more than once
        } else if (this.inputs[0].codeSet.has(code)) {
            let firstInput = this.inputs[0];
            if (firstInput.action) firstInput.action();
            this.#inputStage = loopInt(0, this.inputs.length, 1);
            this.#setNewInputTimeout(firstInput.timeout);
            // If event code does not match next expected input or first input, and inputStage is not zero, sequence must be broken, reset
        } else if (this.#inputStage != 0) {
            this.#handleInputBreak();
        }
    }

    #setNewInputTimeout(time) {
        clearTimeout(this.#timeout);
        this.#timeout = setTimeout(this.#handleInputBreak.bind(this), time);
    }

    #handleInputBreak() {
        if (this.onInputBreak) this.onInputBreak();
        this.#inputStage = 0;
    }

    getAllInputKeys() {
        let allInputKeys = [];
        this.inputs.forEach((input) => {
            input.codeSet.forEach((code) => {
                if (input.type != 'hold')
                    allInputKeys.push(
                        InputController.createBoundInputKey(input.type, code)
                    );
                else {
                    // 'hold' events need to hear about both keydown and keyup
                    allInputKeys.push(
                        InputController.createBoundInputKey('keydown', code)
                    );
                    allInputKeys.push(
                        InputController.createBoundInputKey('keyup', code)
                    );
                }
            });
        });
        return allInputKeys;
    }
}

class KeyEvent {
    // type e.g. keydown, hold, keyup
    // action e.g. a function to call when the key event happens
    constructor(
        codeArray,
        type = 'keydown',
        action = null,
        timeout = standardInputTimeout
    ) {
        this.codeSet = new Set(codeArray);
        this.type = type;
        this.action = action;
        this.timeout = timeout;
    }
}

export { InputController, InputSequence, KeyEvent };
