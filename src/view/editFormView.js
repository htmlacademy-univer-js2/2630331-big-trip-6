import AbstractStatefulView from './abstract-stateful-view.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const EVENT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

function formatDateForInput(isoString) {
  return dayjs(isoString).format('DD/MM/YY HH:mm');
}

export default class EditFormView extends AbstractStatefulView {
  #destination = null;
  #availableOffers = [];
  #formSubmitHandler = null;
  #rollupClickHandler = null;

  constructor(point, destination, availableOffers = []) {
    const initialState = {
      type: point?.type || 'flight',
      dateFrom: point?.dateFrom || new Date().toISOString(),
      dateTo: point?.dateTo || new Date().toISOString(),
      basePrice: point?.basePrice || '',
      selectedOffers: [...(point?.offers || [])]
    };

    super(initialState);

    this.#destination = destination;
    this.#availableOffers = availableOffers;
  }

  get template() {
    const state = this.getState();
    const { type, dateFrom, dateTo, basePrice, selectedOffers } = state;
    
    const destinationName = this.#destination?.name || '';
    const destinationDescription = this.#destination?.description || '';
    const photos = this.#destination?.pictures || [];

    const typeOptionsHtml = EVENT_TYPES.map(eventType => `
      <div class="event__type-item">
        <input id="event-type-${eventType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}" ${eventType === type ? 'checked' : ''}>
        <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType.charAt(0).toUpperCase() + eventType.slice(1)}</label>
      </div>
    `).join('');

    const offersHtml = this.#availableOffers.length > 0 ? `
      <div class="event__available-offers">
        ${this.#availableOffers.map((offer) => `
          <div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-1" type="checkbox" name="event-offer-${offer.id}" ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
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

    const destinationSectionHtml = this.#destination ? `
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
        <button class="event__reset-btn  event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>

      <section class="event__details">
        ${this.#availableOffers.length > 0 ? `
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            ${offersHtml}
          </section>
        ` : ''}
        ${destinationSectionHtml}
      </section>
    </form>`;
  }

  /**
   * Attach event listeners for all form inputs
   * This is called automatically after rendering
   */
  attachEventListeners() {
    const form = this.element;
    if (!form) return;

    // Handle event type changes
    const typeInputs = form.querySelectorAll('input[name="event-type"]');
    typeInputs.forEach(input => {
      input.addEventListener('change', (evt) => {
        this.updateState({ type: evt.target.value });
      });
    });

    // Handle offer selection changes
    const offerCheckboxes = form.querySelectorAll('.event__offer-checkbox');
    offerCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (evt) => {
        const offerId = evt.target.name.replace('event-offer-', '');
        const currentOffers = this.getStateValue('selectedOffers') || [];
        
        if (evt.target.checked) {
          this.updateState({
            selectedOffers: [...currentOffers, offerId]
          });
        } else {
          this.updateState({
            selectedOffers: currentOffers.filter(id => id !== offerId)
          });
        }
      });
    });

    // Setup flatpickr for date/time inputs
    const startTimeInput = form.querySelector('#event-start-time-1');
    const endTimeInput = form.querySelector('#event-end-time-1');
    const priceInput = form.querySelector('#event-price-1');

    if (startTimeInput) {
      flatpickr(startTimeInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: dayjs(this.getStateValue('dateFrom')).toDate(),
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            this.updateState({ dateFrom: selectedDates[0].toISOString() });
          }
        }
      });
    }

    if (endTimeInput) {
      flatpickr(endTimeInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: dayjs(this.getStateValue('dateTo')).toDate(),
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            this.updateState({ dateTo: selectedDates[0].toISOString() });
          }
        }
      });
    }

    // Handle price input changes
    if (priceInput) {
      priceInput.addEventListener('change', (evt) => {
        this.updateState({ basePrice: evt.target.value });
      });
    }

    // Handle form submission
    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      if (this.#formSubmitHandler) {
        this.#formSubmitHandler();
      }
    });

    // Handle rollup (close) button
    const rollupBtn = form.querySelector('.event__rollup-btn');
    if (rollupBtn) {
      rollupBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        if (this.#rollupClickHandler) {
          this.#rollupClickHandler();
        }
      });
    }
  }

  setFormSubmitHandler(callback) {
    this.#formSubmitHandler = callback;
    // Re-attach listeners to ensure they're set up
    this.attachEventListeners();
  }

  setRollupClickHandler(callback) {
    this.#rollupClickHandler = callback;
    // Re-attach listeners to ensure they're set up
    this.attachEventListeners();
  }
}
