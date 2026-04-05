import View from './view.js';

export default class EmptyListView extends View {
  #message = null;

  constructor(message = 'No events found. Create your first trip!') {
    super();
    this.#message = message;
  }

  get template() {
    return `<section class="trip-events">
      <h2 class="visually-hidden">Trip events</h2>
      <p class="trip-events__msg">${this.#message}</p>
    </section>`;
  }
}
