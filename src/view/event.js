function formatDate(isoString) {
  const date = new Date(isoString);
  const options = { month: 'short', day: '2-digit' };
  return date.toLocaleDateString('en-US', options).toUpperCase();
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function calculateDuration(dateFrom, dateTo) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const diffMs = to - from;
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins}M`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (mins === 0) {
    return `${hours}H`;
  }

  return `${hours}H ${mins}M`;
}

export default class Event {
  constructor(point, destination, offers) {
    this.element = null;
    this.point = point;
    this.destination = destination;
    this.offers = offers || [];
  }

  getTemplate() {
    const { type, dateFrom, dateTo, basePrice } = this.point;
    const destinationName = this.destination ? this.destination.name : 'Unknown';

    const dateFormatted = formatDate(dateFrom);
    const timeStart = formatTime(dateFrom);
    const timeEnd = formatTime(dateTo);
    const duration = calculateDuration(dateFrom, dateTo);

    const offersHtml = this.offers.length > 0 ? `
      <ul class="event__selected-offers">
        ${this.offers.map(offer => `
          <li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>
        `).join('')}
      </ul>
    ` : '';

    return `<div class="event">
      <time class="event__date" datetime="${dateFrom.split('T')[0]}">${dateFormatted}</time>
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
      <button class="event__favorite-btn ${this.point.isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
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

  getElement() {
    if (!this.element) {
      const div = document.createElement('div');
      div.innerHTML = this.getTemplate();
      this.element = div.firstElementChild;
    }
    return this.element;
  }
}
