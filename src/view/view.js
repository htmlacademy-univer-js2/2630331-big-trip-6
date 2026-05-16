export default class View {
  #element = null;

  get element() {
    if (!this.#element) {
      this.#element = this.createElement(this.template);
    }
    return this.#element;
  }

  get template() {
    throw new Error('template getter must be implemented in subclass');
  }

  createElement(markup) {
    const div = document.createElement('div');
    div.innerHTML = markup;
    return div.firstElementChild;
  }

  getElement() {
    return this.element;
  }

  removeElement() {
    this.#element = null;
  }
}
