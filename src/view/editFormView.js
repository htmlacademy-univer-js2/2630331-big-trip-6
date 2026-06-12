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
  #resetClickHandler = null;

  constructor(point, destination, availableOffers = [], isNew = false, destinations = new Map(), offersMap = new Map()) {
    const initialState = {
      type: point?.type || 'flight',
      dateFrom: point?.dateFrom ?? null,
      dateTo: point?.dateTo ?? null,
      basePrice: (point?.basePrice !== undefined && point?.basePrice !== null) ? point.basePrice : 0,
      selectedOffers: Array.from(point?.offers || []),
      destinationName: destination?.name || '',
      destinationId: destination?.id || ''
    };

    super(initialState);

    this._isNew = isNew;
    this._destinations = destinations;
    this._offersMap = offersMap;
    this.#destination = destination;
    this.#availableOffers = availableOffers;
  }

  get template() {
    const state = this.getState();
    const { type, dateFrom, dateTo, basePrice, selectedOffers } = state;

    const destinationName = state.destinationName || this.#destination?.name || '';
    const destinationDescription = this.#destination?.description || '';
    const photos = this.#destination?.pictures || [];

    const typeOptionsHtml = EVENT_TYPES.map((eventType) => `
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
          ${photos.map((photo) => `
            <img class="event__photo" src="${photo.src}" alt="${photo.description}">
          `).join('')}
        </div>
      </div>
    ` : '';

    const destinationSectionHtml = (this.#destination && (destinationDescription || photos.length > 0)) ? `
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
            ${Array.from(this._destinations.values()).map((d) => `<option value="${d.name}"></option>`).join('')}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom ? formatDateForInput(dateFrom) : ''}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo ? formatDateForInput(dateTo) : ''}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice !== null && basePrice !== undefined ? basePrice : 0}">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="button">${this._isNew ? 'Cancel' : 'Delete'}</button>
        ${!this._isNew ? '<button class="event__rollup-btn" type="button"><span class="visually-hidden">Close event</span></button>' : ''}
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
    if (!form) {
      return;
    }

    // Handle event type changes
    const typeInputs = form.querySelectorAll('input[name="event-type"]');
    typeInputs.forEach((input) => {
      input.addEventListener('change', (evt) => {
        const newType = evt.target.value;
        if (this._offersMap && this._offersMap.size > 0) {
          this.#availableOffers = Array.from(this._offersMap.values())
            .filter((o) => o.type === newType)
            // eslint-disable-next-line no-unused-vars
            .map(({type: _type, ...o}) => o);
        }
        this.updateState({ type: newType, selectedOffers: [] });
      });
    });

    // Handle offer selection changes
    const offerCheckboxes = form.querySelectorAll('.event__offer-checkbox');
    offerCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (evt) => {
        const offerId = evt.target.name.replace('event-offer-', '');
        const currentOffers = this.getStateValue('selectedOffers') || [];

        if (evt.target.checked) {
          this.updateState({
            selectedOffers: [...currentOffers, offerId]
          });
        } else {
          this.updateState({
            selectedOffers: currentOffers.filter((id) => id !== offerId)
          });
        }
      });
    });

    // Remove orphaned flatpickr calendars
    document.querySelectorAll('.flatpickr-calendar').forEach((cal) => {
      if (!cal.classList.contains('open') && !cal.classList.contains('inline')) {
        cal.remove();
      }
    });
    // Remove orphaned flatpickr calendars
    document.querySelectorAll('.flatpickr-calendar').forEach((cal) => {
      if (!cal.classList.contains('open') && !cal.classList.contains('inline')) {
        cal.remove();
      }
    });
    // Remove orphaned flatpickr calendars
    document.querySelectorAll('.flatpickr-calendar').forEach((cal) => {
      if (!cal.classList.contains('open') && !cal.classList.contains('inline')) {
        cal.remove();
      }
    });
    // Remove orphaned flatpickr calendars
    document.querySelectorAll('.flatpickr-calendar').forEach((cal) => {
      if (!cal.classList.contains('open') && !cal.classList.contains('inline')) {
        cal.remove();
      }
    });
    // Remove orphaned flatpickr calendars
    document.querySelectorAll('.flatpickr-calendar').forEach((cal) => {
      if (!cal.classList.contains('open') && !cal.classList.contains('inline')) {
        cal.remove();
      }
    });
    // Remove orphaned flatpickr calendars
    document.querySelectorAll('.flatpickr-calendar').forEach((cal) => {
      if (!cal.classList.contains('open') && !cal.classList.contains('inline')) {
        cal.remove();
      }
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

    // Handle destination input changes
    const destInput = form.querySelector('.event__input--destination');
    if (destInput) {
      destInput.addEventListener('change', (evt) => {
        const newName = evt.target.value;
        let newDest = null;
        let newDestId = '';
        for (const [id, dest] of this._destinations) {
          if (dest.name === newName) {
            newDest = dest; newDestId = id; break;
          }
        }
        if (newDest) {
          this.#destination = newDest;
        }
        this.updateState({ destinationName: newName, destinationId: newDestId });
      });
    }

    // Handle price input changes
    if (priceInput) {
      priceInput.addEventListener('input', (evt) => {
        this._state.basePrice = evt.target.value;
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
        if (evt.detail === 0 && (this._isSaving || this._isDeleting)) {
          return;
        }
        evt.preventDefault();
        if (this.#rollupClickHandler) {
          this.#rollupClickHandler();
        }
      });
    }
    // Handle reset (delete/cancel) button
    const resetBtn = form.querySelector('.event__reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', (evt) => {
        if (evt.detail === 0 && (this._isSaving || this._isDeleting)) {
          return;
        }
        evt.preventDefault();
        if (this.#resetClickHandler) {
          this.#resetClickHandler();
        }
      });
    }
  }

  restoreHandlers() {
    const currentType = this.getStateValue('type');
    if (this._offersMap && this._offersMap.size > 0) {
      this.#availableOffers = Array.from(this._offersMap.values())
        .filter((o) => o.type === currentType)
        // eslint-disable-next-line no-unused-vars
        .map(({type: _type, ...o}) => o);
    }
    this.attachEventListeners();
  }

  setFormSubmitHandler(callback) {
    this.#formSubmitHandler = callback;
  }

  setRollupClickHandler(callback) {
    this.#rollupClickHandler = callback;
  }

  setResetClickHandler(callback) {
    this.#resetClickHandler = callback;
  }

  /**
   * Apply shake animation to the form
   * Used to indicate an error to the user
   */
  shake() {
    const el = this.element;
    if (!el) {
      return;
    }
    el.style.position = 'relative';
    let step = 0;
    const offsets = [10, -10, 8, -8, 5, -5, 0];
    const id = setInterval(() => {
      el.style.left = `${offsets[step] }px`;
      step++;
      if (step >= offsets.length) {
        clearInterval(id);
        el.style.left = '';
        el.style.position = '';
      }
    }, 60);
  }

  /**
   * Set saving state on the form
   * Disables inputs/buttons and updates save button text
   * @param {boolean} isSaving - True to enable saving state, false to disable
   */
  setSaving(isSaving) {
    this._isSaving = isSaving;
    const saveBtn = this.element.querySelector('[type="submit"]');
    if (saveBtn) {
      saveBtn.disabled = isSaving;
      saveBtn.textContent = isSaving ? 'Saving...' : 'Save';
    }
    this._setDisabled(isSaving);
  }

  /**
   * Set deleting state on the form
   * Disables inputs/buttons and updates delete button text
   * @param {boolean} isDeleting - True to enable deleting state, false to disable
   */
  setDeleting(isDeleting) {
    this._isDeleting = isDeleting;
    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.disabled = isDeleting;
      deleteBtn.textContent = isDeleting ? 'Deleting...' : 'Delete';
    }
    this._setDisabled(isDeleting);
  }

  /**
   * Disable/enable all form inputs and buttons
   * @private
   * @param {boolean} state - True to disable, false to enable
   */
  _setDisabled(state) {
    const form = this.element;
    if (!form) {
      return;
    }

    form.querySelectorAll('input[type="text"], input[type="checkbox"], input[type="radio"], .event__save-btn, textarea')
      .forEach((el) => {
        el.disabled = state;
      });
  }
}

