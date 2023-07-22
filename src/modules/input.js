import { loopInt } from './util';

const slowInputTimeout = 750;
const standardInputTimeout = 600;
const fastInputTimeout = 500;

const inputSetTimeout = 20;

const repeatInterval = 100;

class InputController {
    // Points the way for the key event to the correct binding group
    static boundInputs = new Map();
    // E.g. each player has their own group
    static bindingGroups = new Map();
    static repeatingActions = new Set();

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
                this.createBoundInputKey(event.type, event.code)
            )
        ) {
            for (let inputSequence of this.#getAssociatedInputGroup(event)
                .inputSequences) {
                inputSequence.handleInput(event);
            }
        }
    }

    static runRepeatingActions() {
        // any held inputs with actions will be called
        // when they are pressed, and then repeatedly until the key is let go

        // it makes more sense to have this on each input sequence itself, but...
        // having an interval being called per input sequence would be less efficient than
        // having one interval on the input controller?? Riiight?
        InputController.repeatingActions?.forEach((action) => {
            action();
        });
    }
}

setInterval(InputController.runRepeatingActions, repeatInterval);

class InputSequence {
    #expectedInput = null;
    #inputStage = 0;
    #inputSet = new Set();
    #inputStageTimeout = null;

    #minInputStage = 0;
    #heldInput = null;

    // inputs e.g. an array of key events
    // onInputBreak e.g. a function triggered when sequence fails
    constructor(inputs, onInputBreak = null) {
        this.inputs = inputs;
        this.onInputBreak = onInputBreak;
    }

    handleInput(event) {
        let code = event.code;
        let type = event.type;

        this.#expectedInput = this.inputs[this.#inputStage];

        if (this.#expectedInput.type === type) {
            // i.e. keydown or keyup
            if (this.#expectedInput.codeSet.has(code))
                this.#addToInputSet(code);
            else if (
                this.inputs[0].type === type &&
                this.inputs[0].codeSet.has(code)
            ) {
                this.#inputStage = 0;
                this.#inputSet.clear();
                this.#addToInputSet(code);
            }
        } else if (this.#expectedInput.type === 'hold') {
            // expected 'hold' input needs to deal with keydown and keyup
            switch (type) {
                case 'keydown':
                    if (this.#expectedInput.codeSet.has(code))
                        this.#addToInputSet(code);
                    break;
                case 'keyup':
                    if (this.#inputSet.has(code)) this.#inputSet.delete(code);
                    break;
            }
        }
        // need to deal with any held inputs that are let go
        if (type === 'keyup' && this.#heldInput?.codeSet.has(code))
            this.#cancelHeldInput(code);
    }

    #addToInputSet(code) {
        this.#inputSet.add(code);
        switch (this.#expectedInput.type) {
            case 'hold':
                if (this.#expectedInput.codeSet.size === this.#inputSet.size) {
                    // store heldInput and minInput stage - while these keys are held, if the sequence is broken it will not go below minStage
                    this.#heldInput = this.#expectedInput;
                    // loop int, so if hold event is for some reason the last in a sequence, it will loop back to the first input in sequence instead of breaking
                    this.#minInputStage = loopInt(
                        0,
                        this.inputs.length,
                        this.#inputStage + 1
                    );
                    this.#advanceInputStage();
                }
                break;
            default:
                if (this.#expectedInput.codeSet.size === this.#inputSet.size)
                    this.#advanceInputStage();
                else
                    setTimeout(
                        () => this.#inputSet.delete(code),
                        inputSetTimeout
                    );
        }
    }

    #cancelHeldInput(code) {
        InputController.repeatingActions.delete(this.#heldInput.action);
        this.#inputSet = new Set(this.#heldInput.codeSet);
        this.#inputSet.delete(code);
        this.#heldInput = null;
        this.#inputStage = 0;
        this.#minInputStage = 0;
    }

    #advanceInputStage() {
        // if current input stage is not hold type, and we have not just completed the sequence,
        // set off input stage timeout - if next input is not hit before timeout expires, handleInputBreak occurs
        this.#expectedInput.action?.();
        if (this.#expectedInput.type !== 'hold') {
            this.#setNewInputStageTimeout(this.#expectedInput.timeout);
        } else {
            if (this.#expectedInput.action != null)
                InputController.repeatingActions.add(
                    this.#expectedInput.action
                );
            console.log(InputController.repeatingActions);
        }
        // if we have reached the end of the sequence, cancel any remaining timeouts
        if (this.#inputStage >= this.inputs.length - 1)
            clearTimeout(this.#inputStageTimeout);
        this.#inputStage = loopInt(
            this.#minInputStage,
            this.inputs.length,
            this.#inputStage + 1
        );
        this.#inputSet.clear();
    }

    #setNewInputStageTimeout(time) {
        clearTimeout(this.#inputStageTimeout);
        this.#inputStageTimeout = setTimeout(
            this.#handleInputBreak.bind(this),
            time
        );
    }

    #handleInputBreak() {
        if (this.onInputBreak) this.onInputBreak();
        this.#inputStage = this.#minInputStage;
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
