import View from './view.js';
import dayjs from 'dayjs';

function formatDate(isoString) {
  return dayjs(isoString).format('MMM DD').toUpperCase();
}

function formatTime(isoString) {
  return dayjs(isoString).format('HH:mm');
}

function calculateDuration(dateFrom, dateTo) {
  const from = dayjs(dateFrom);
  const to = dayjs(dateTo);
  const diffMins = to.diff(from, 'minute');
  const days = Math.floor(diffMins / (60 * 24));
  const hours = Math.floor((diffMins % (60 * 24)) / 60);
  const mins = diffMins % 60;
  if (days > 0) {
    return String(days).padStart(2, '0') + 'D ' + String(hours).padStart(2, '0') + 'H ' + String(mins).padStart(2, '0') + 'M';
  }
  if (hours > 0) {
    return String(hours).padStart(2, '0') + 'H ' + String(mins).padStart(2, '0') + 'M';
  }
  return String(mins).padStart(2, '0') + 'M';
}

export default class RoutePointView extends View {
  #point = null;
  #destination = null;
  #offers = null;
  #editClickHandler = null;
  #favoriteClickHandler = null;

  constructor(point, destination, offers = []) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers || [];
  }

  get template() {
    const { type, dateFrom, dateTo, basePrice } = this.#point;
    const destinationName = this.#destination ? this.#destination.name : 'Unknown';

    const dateFormatted = dateFrom ? formatDate(dateFrom) : "";
    const timeStart = dateFrom ? formatTime(dateFrom) : "";
    const timeEnd = dateTo ? formatTime(dateTo) : "";
    const duration = dateFrom && dateTo ? calculateDuration(dateFrom, dateTo) : "00M";

    const offersHtml = this.#offers.length > 0 ? `
      <ul class="event__selected-offers">
        ${this.#offers.map(offer => `
          <li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>
        `).join('')}
      </ul>
    ` : '';

    return `<div class="event">
      <time class="event__date" datetime="${dateFrom ? dateFrom.split('T')[0] : ''}">${dateFormatted}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${type.charAt(0).toUpperCase() + type.slice(1)} ${destinationName}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${dateFrom}">${timeStart}</time>
          &mdash;
          <time class="event__end-time" datetime="${dateTo}">${timeEnd}</time>
        </p>
        <p class="event__duration">${duration}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      ${offersHtml}
      <button class="event__favorite-btn ${this.#point.isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>`;
  }

  setEditClickHandler(callback) {
    this.#editClickHandler = callback;
    const btn = this.element.querySelector('.event__rollup-btn');
    btn.addEventListener('click', (evt) => { if (evt.detail === 0) return; this.#editClickHandler(); });
  }

  shake() {
    const el = this.element;
    if (!el) return;
    const target = el.parentElement && el.parentElement.tagName === 'LI' ? el.parentElement : el;
    target.style.position = 'relative';
    let step = 0;
    const offsets = [10, -10, 8, -8, 5, -5, 0];
    const id = setInterval(() => {
      target.style.left = offsets[step] + 'px';
      step++;
      if (step >= offsets.length) {
        clearInterval(id);
        target.style.left = '';
        target.style.position = '';
      }
    }, 60);
  }

  setFavoriteClickHandler(callback) {
    this.#favoriteClickHandler = callback;
    this.element.querySelector('.event__favorite-btn').addEventListener('click', () => {
      this.#favoriteClickHandler();
    });
  }
}
