import InputController from "./inputcontroller";
import { loopInt } from "../util";

const inputSetTimeout = 20;
const repeatInterval = 100;

export default class InputSequence {
  #expectedInput = null;
  #inputStage = 0;
  #inputSet = new Set();
  #inputStageTimeout = null;

  #minInputStage = 0;
  #heldInput = null;
  #heldInputInterval = null;

  // inputs e.g. an array of key events
  // onInputBreak e.g. a function triggered when sequence fails
  constructor(inputs, onInputBreak = null) {
      this.inputs = inputs;
      this.onInputBreak = onInputBreak;
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
      clearInterval(this.#heldInputInterval);
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
              this.#heldInputInterval = setInterval(
                  this.#expectedInput.action,
                  repeatInterval
              );
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
}