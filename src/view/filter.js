import View from './view.js';

const DEFAULT_FILTERS = [
  { type: 'everything', label: 'Everything', isDisabled: false },
  { type: 'future', label: 'Future', isDisabled: false },
  { type: 'present', label: 'Present', isDisabled: false },
  { type: 'past', label: 'Past', isDisabled: false }
];

export default class Filter extends View {
  #filters = [];
  #activeFilter = 'everything';

  constructor(filters = DEFAULT_FILTERS, activeFilter = 'everything') {
    super();
    this.#filters = filters;
    this.#activeFilter = activeFilter;
  }

  get template() {
    const filtersHtml = this.#filters.map(filter => `
      <div class="trip-filters__filter">
        <input
          id="filter-${filter.type}"
          class="trip-filters__filter-input  visually-hidden"
          type="radio"
          name="trip-filter"
          value="${filter.type}"
          ${filter.isDisabled ? 'disabled' : ''}
          ${this.#activeFilter === filter.type ? 'checked' : ''}
        >
        <label class="trip-filters__filter-label" for="filter-${filter.type}">
          ${filter.label}
        </label>
      </div>
    `).join('');

    return `<form class="trip-filters">
      ${filtersHtml}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`;
  }
}
