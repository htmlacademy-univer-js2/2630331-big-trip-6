import AbstractView from './view.js';

export default class AbstractStatefulView extends AbstractView {
  _state = {};

  constructor(initialState = {}) {
    super();
    this._state = structuredClone(initialState);
  }

  getState() {
    return structuredClone(this._state);
  }

  getStateValue(key) {
    return this._state[key];
  }

  updateState(update) {
    if (update) {
      this._setState(update);
      this._rerenderElement();
    }
  }

  updateElement(update) {
    if (update) {
      this._setState(update);
      this._rerenderElement();
    }
  }

  _setState(update) {
    this._state = structuredClone({...this._state, ...update});
  }

  _rerenderElement() {
    const prevElement = this.element;
    const parent = prevElement.parentElement;
    if (parent) {
      this.removeElement();
      const newElement = this.element;
      parent.replaceChild(newElement, prevElement);
      this.restoreHandlers();
    }
  }

  restoreHandlers() {
    throw new Error('Abstract method not implemented: restoreHandlers');
  }
}