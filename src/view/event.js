export default class Event {
  constructor(eventData = {}) {
    this.element = null;
    this.eventData = eventData;
  }

  getTemplate() {
    const {
      date = 'MAR 18',
      dateTime = '2019-03-18',
      typeIcon = 'taxi',
      title = 'Taxi Amsterdam',
      startTime = '10:30',
      endTime = '11:00',
      startDateTime = '2019-03-18T10:30',
      endDateTime = '2019-03-18T11:00',
      duration = '30M',
      price = '20',
      offers = []
    } = this.eventData;

    const offersHtml = offers.length > 0 ? `
      <ul class="event__selected-offers">
        ${offers.map(offer => `
          <li class="event__offer">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </li>
        `).join('')}
      </ul>
    ` : '';

    return `<div class="event">
      <time class="event__date" datetime="${dateTime}">${date}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${typeIcon}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${title}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${startDateTime}">${startTime}</time>
          &mdash;
          <time class="event__end-time" datetime="${endDateTime}">${endTime}</time>
        </p>
        <p class="event__duration">${duration}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${price}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      ${offersHtml}
      <button class="event__favorite-btn event__favorite-btn--active" type="button">
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
