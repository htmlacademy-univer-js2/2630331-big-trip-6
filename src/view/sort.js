import View from './view.js';

const DEFAULT_SORTS = [
  { type: 'day', label: 'Day', isDisabled: false, isActive: true },
  { type: 'event', label: 'Event', isDisabled: true, isActive: false },
  { type: 'time', label: 'Time', isDisabled: false, isActive: false },
  { type: 'price', label: 'Price', isDisabled: false, isActive: false },
  { type: 'offer', label: 'Offers', isDisabled: true, isActive: false }
];

export default class Sort extends View {
  #sorts = [];

  constructor(sorts = DEFAULT_SORTS) {
    super();
    this.#sorts = sorts;
  }

  get template() {
    const sortsHtml = this.#sorts.map(sort => `
      <div class="trip-sort__item  trip-sort__item--${sort.type}">
        <input
          id="sort-${sort.type}"
          class="trip-sort__input  visually-hidden"
          type="radio"
          name="trip-sort"
          value="sort-${sort.type}"
          ${sort.isDisabled ? 'disabled' : ''}
          ${sort.isActive ? 'checked' : ''}
        >
        <label class="trip-sort__btn" for="sort-${sort.type}">
          ${sort.label}
        </label>
      </div>
    `).join('');

    return `<form class="trip-events__trip-sort  trip-sort">
      ${sortsHtml}
    </form>`;
  }
}
