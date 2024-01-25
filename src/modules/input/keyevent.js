export const slowInputTimeout = 750;
export const standardInputTimeout = 600;
export const fastInputTimeout = 500;

export default class KeyEvent {
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