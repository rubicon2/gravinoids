export default class InputController {
    // Points the way for the key event to the correct binding group
    static #boundInputs = new Map();
    // E.g. each player has their own group
    static #bindingGroups = new Map();

    static addBindingGroup(groupName, isActive, inputSequences) {
        if (!this.#bindingGroups.has(groupName)) {
            this.#bindingGroups.set(groupName, { isActive, inputSequences });
            inputSequences.forEach((inputSeq) => {
                let inputKeys = inputSeq.getAllInputKeys();
                inputKeys.forEach((inputKey) => {
                    if (!this.#boundInputs.has(inputKey)) {
                        this.#boundInputs.set(inputKey, groupName);
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
        let groupName = this.#boundInputs.get(
            this.createBoundInputKey(event.type, event.code)
        );
        return this.#bindingGroups.get(groupName);
    }

    static handleKeyDown(event) {
        if (
            this.#boundInputs.has(
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
            this.#boundInputs.has(
                this.createBoundInputKey(event.type, event.code)
            )
        ) {
            for (let inputSequence of this.#getAssociatedInputGroup(event)
                .inputSequences) {
                inputSequence.handleInput(event);
            }
        }
    }
}
