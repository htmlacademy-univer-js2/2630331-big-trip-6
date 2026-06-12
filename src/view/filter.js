import { FilterType } from '../utils/filter-utils.js';

export default class Filter {
  constructor() {
    this.element = null;
    this.disabledFilters = {};
    this._activeFilter = 'everything';
  }

  getTemplate() {
    const filters = [
      { id: 'everything', value: FilterType.EVERYTHING, label: 'Everything' },
      { id: 'future', value: FilterType.FUTURE, label: 'Future' },
      { id: 'present', value: FilterType.PRESENT, label: 'Present' },
      { id: 'past', value: FilterType.PAST, label: 'Past' }
    ];

    const filterHtml = filters.map((filter) => {
      const isDisabled = this.disabledFilters[filter.value] ? 'disabled' : '';
      return `
        <div class="trip-filters__filter">
          <input 
            id="filter-${filter.id}" 
            class="trip-filters__filter-input  visually-hidden" 
            type="radio" 
            name="trip-filter" 
            value="${filter.value}"
            ${filter.value === this._activeFilter ? 'checked' : ''}
            ${isDisabled}
          >
          <label class="trip-filters__filter-label" for="filter-${filter.id}">${filter.label}</label>
        </div>
      `;
    }).join('');

    return `<form class="trip-filters">
      ${filterHtml}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`;
  }

  getElement() {
    if (!this.element) {
      const div = document.createElement('div');
      div.innerHTML = this.getTemplate();
      this.element = div.firstElementChild;
    }
    return this.element;
  }

  /**
   * Update disabled state for filters and re-render
   * @param {Object} disabledFilters - Object with filter type as key and boolean as value
   */
  updateDisabledFilters(disabledFilters) {
    this.disabledFilters = disabledFilters;

    if (this.element) {
      const newElement = document.createElement('div');
      newElement.innerHTML = this.getTemplate();
      const newFilterForm = newElement.firstElementChild;
      this.element.replaceWith(newFilterForm);
      this.element = newFilterForm;
      if (this._filterChangeCallback) {
        this.element.addEventListener('change', (evt) => {
          if (evt.target.name === 'trip-filter') {
            this._filterChangeCallback(evt.target.value);
          }
        });
      }
      // restore active filter visually
      const activeInput = this.element.querySelector(`[value="${this._activeFilter}"]`);
      if (activeInput) {
        activeInput.checked = true;
      }
    }
  }

  /**
   * Set filter change handler
   * @param {Function} callback - Called with filter value when user selects filter
   */
  setFilterChangeHandler(callback) {
    this._filterChangeCallback = (val) => {
      this._activeFilter = val; callback(val);
    };
    this.getElement().addEventListener('change', (evt) => {
      if (evt.target.name === 'trip-filter') {
        callback(evt.target.value);
      }
    });
  }
}
