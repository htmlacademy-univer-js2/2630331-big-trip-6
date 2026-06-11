export default class Sort {
  constructor() {
    this.element = null;
    this._sortChangeCallback = null;
    this._activeSort = 'sort-day';
  }
  getTemplate() {
    const s = this._activeSort;
    return '<form class="trip-events__trip-sort  trip-sort">' +
      '<div class="trip-sort__item  trip-sort__item--day">' +
        '<input id="sort-day" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-day"' + (s === 'sort-day' ? ' checked' : '') + '>' +
        '<label class="trip-sort__btn" for="sort-day">Day</label>' +
      '</div>' +
      '<div class="trip-sort__item  trip-sort__item--event">' +
        '<input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled>' +
        '<label class="trip-sort__btn" for="sort-event">Event</label>' +
      '</div>' +
      '<div class="trip-sort__item  trip-sort__item--time">' +
        '<input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-time"' + (s === 'sort-time' ? ' checked' : '') + '>' +
        '<label class="trip-sort__btn" for="sort-time">Time</label>' +
      '</div>' +
      '<div class="trip-sort__item  trip-sort__item--price">' +
        '<input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-price"' + (s === 'sort-price' ? ' checked' : '') + '>' +
        '<label class="trip-sort__btn" for="sort-price">Price</label>' +
      '</div>' +
      '<div class="trip-sort__item  trip-sort__item--offer">' +
        '<input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled>' +
        '<label class="trip-sort__btn" for="sort-offer">Offers</label>' +
      '</div>' +
    '</form>';
  }
  getElement() {
    if (!this.element) {
      const div = document.createElement('div');
      div.innerHTML = this.getTemplate();
      this.element = div.firstElementChild;
    }
    return this.element;
  }
  setSortChangeHandler(callback) {
    this._sortChangeCallback = function(val) { this._activeSort = val; callback(val); }.bind(this);
    this.getElement().addEventListener('change', (evt) => {
      if (evt.target.name === 'trip-sort') {
        this._sortChangeCallback(evt.target.value);
      }
    });
  }
  resetSort() {
    this._activeSort = 'sort-day';
    if (this.element) {
      const input = this.element.querySelector('[value="sort-day"]');
      if (input) { input.checked = true; }
    }
  }
}