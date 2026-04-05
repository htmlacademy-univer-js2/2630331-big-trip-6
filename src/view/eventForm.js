const EVENT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

function formatDateForInput(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${mins}`;
}

export default class EventForm {
  constructor(point = null, destination = null, availableOffers = []) {
    this.element = null;
    this.point = point;
    this.destination = destination;
    this.availableOffers = availableOffers;
  }

  getTemplate() {
    const isNew = !this.point;
    const type = this.point?.type || 'flight';
    const dateFrom = this.point?.dateFrom || new Date().toISOString();
    const dateTo = this.point?.dateTo || new Date().toISOString();
    const basePrice = this.point?.basePrice || '';
    const destinationName = this.destination?.name || '';
    const destinationDescription = this.destination?.description || '';
    const photos = this.destination?.pictures || [];
    const selectedOfferIds = this.point?.offers || [];

    const typeOptionsHtml = EVENT_TYPES.map(eventType => `
      <div class="event__type-item">
        <input id="event-type-${eventType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}" ${eventType === type ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType.charAt(0).toUpperCase() + eventType.slice(1)}</label>
      </div>
    `).join('');

    const offersHtml = this.availableOffers.length > 0 ? `
      <div class="event__available-offers">
        ${this.availableOffers.map((offer, index) => `
          <div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer-${offer.id}" ${selectedOfferIds.includes(offer.id) ? 'checked' : ''}>
            <label class="event__offer-label" for="event-offer-${offer.id}-1">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    ` : '';

    const photosHtml = photos.length > 0 ? `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${photos.map(photo => `
            <img class="event__photo" src="${photo.src}" alt="${photo.description}">
          `).join('')}
        </div>
      </div>
    ` : '';

    const destinationSectionHtml = this.destination ? `
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${destinationDescription}</p>
        ${photosHtml}
      </section>
    ` : '';

    return `<form class="event event--edit">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${typeOptionsHtml}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
          <datalist id="destination-list-1">
            <option value="Amsterdam"></option>
            <option value="Geneva"></option>
            <option value="Chamonix"></option>
            <option value="Paris"></option>
            <option value="Brussels"></option>
            <option value="Cologne"></option>
            <option value="Lyon"></option>
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDateForInput(dateFrom)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDateForInput(dateTo)}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">${isNew ? 'Cancel' : 'Delete'}</button>
      </header>

      <section class="event__details">
        ${this.availableOffers.length > 0 ? `
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            ${offersHtml}
          </section>
        ` : ''}
        ${destinationSectionHtml}
      </section>
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
}







