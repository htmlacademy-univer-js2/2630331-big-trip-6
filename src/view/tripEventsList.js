export default class TripEventsList {
  constructor() {
    this.element = null;
  }

  getTemplate() {
    return `<ul class="trip-events__list"></ul>`;
  }

  getElement() {
    if (!this.element) {
      const div = document.createElement('div');
      div.innerHTML = this.getTemplate();
      this.element = div.firstElementChild;
    }
    return this.element;
  }
}
