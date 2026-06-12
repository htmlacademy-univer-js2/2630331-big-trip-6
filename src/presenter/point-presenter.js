import RoutePointView from '../view/routePointView.js';
import EditFormView from '../view/editFormView.js';
import { replace } from '../render.js';

export default class PointPresenter {
  #container = null;
  #point = null;
  #destinations = null;
  #offers = null;
  #model = null;
  #apiService = null;
  #onDataChange = null;
  #onModeChange = null;
  #routePointView = null;
  #editFormView = null;
  #mode = 'default';
  #escKeyHandler = null;

  constructor(container, point, destinations, offers, onDataChange, onModeChange, model, apiService) {
    this.#container = container;
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
    this.#model = model;
    this.#apiService = apiService;
  }

  init() {
    if (this.#point.id) {
      const destination = this.#destinations.get(this.#point.destinationId);
      const pointOffers = (this.#point.offers || []).map((id) => this.#offers.get(id)).filter(Boolean);
      this.#routePointView = new RoutePointView(this.#point, destination, pointOffers);
      this.#routePointView.setEditClickHandler(() => this.openEditForm());
      this.#routePointView.setFavoriteClickHandler(() => this.#handleFavoriteClick());
      this.#container.appendChild(this.#routePointView.getElement());
    }
  }

  openEditForm() {
    const destination = this.#destinations.get(this.#point.destinationId);
    const availableOffers = Array.from(this.#offers.values())
      .filter((o) => o.type === this.#point.type)
      .map(({type: _t, ...o}) => o);
    this.#editFormView = new EditFormView(
      this.#point, destination, availableOffers,
      !this.#point.id, this.#destinations, this.#offers
    );
    this.#editFormView.setFormSubmitHandler(() => this.#handleFormSubmit());
    this.#editFormView.setRollupClickHandler(() => this.#handleRollupClick());
    this.#editFormView.setResetClickHandler(() => this.#handleResetClick());

    if (!this.#point.id) {
      this.#container.appendChild(this.#editFormView.getElement());
    } else {
      replace(this.#editFormView, this.#routePointView);
    }
    this.#editFormView.attachEventListeners();

    this.#mode = 'edit';
    this.#attachEscKeyListener();
    if (this.#onModeChange && this.#point.id) {
      this.#onModeChange(this.#point.id);
    }
  }

  resetMode() {
    if (this.#mode === 'edit') {
      this.#switchToDefaultMode();
    }
  }

  destroy() {
    this.#removeEscKeyListener();
    if (this.#routePointView) {
      const el = this.#routePointView.getElement();
      if (el && el.parentElement) {
        el.remove();
      }
    }
    if (this.#editFormView) {
      const el = this.#editFormView.getElement();
      if (el && el.parentElement) {
        el.remove();
      }
    }
    if (this.#container && this.#container.parentElement) {
      this.#container.remove();
    }
  }

  getPointId() {
    return this.#point.id;
  }

  #switchToDefaultMode() {
    if (!this.#point.id) {
      const editEl = this.#editFormView?.getElement?.();
      if (editEl && editEl.parentElement) {
        editEl.remove();
      }
      const container = this.#container;
      if (container && container.parentElement) {
        const list = container.parentElement;
        container.remove();
        if (list && list.children.length === 0) {
          list.innerHTML = '<p class="trip-events__msg">Click New Event to create your first point</p>';
        }
      }
      if (this.#onModeChange) {
        this.#onModeChange(null);
      }
    } else {
      const editEl = this.#editFormView?.getElement?.();
      if (editEl && editEl.parentElement) {
        replace(this.#routePointView, this.#editFormView);
      }
    }
    this.#mode = 'default';
    this.#removeEscKeyListener();
  }

  #handleRollupClick() {
    this.#switchToDefaultMode();
  }

  #handleResetClick() {
    if (this.#point.id) {
      this.#handleDeleteClick();
    } else {
      this.#switchToDefaultMode();
    }
  }

  async #handleFormSubmit() {
    const formState = this.#editFormView.getState();
    if (!formState.destinationName) {
      this.#editFormView.shake();
      this.#editFormView.setSaving(false);
      return;
    }
    let destinationId = formState.destinationId || this.#point.destinationId;
    for (const [id, dest] of this.#destinations) {
      if (dest.name === formState.destinationName) {
        destinationId = id; break;
      }
    }
    const updatedPoint = {
      ...this.#point,
      type: formState.type,
      dateFrom: formState.dateFrom,
      dateTo: formState.dateTo,
      basePrice: parseInt(formState.basePrice, 10) || 0,
      offers: formState.selectedOffers || [],
      destinationId,
    };
    this.#editFormView.setSaving(true);
    try {
      if (this.#point.id) {
        await this.#model.updateWaypoint(updatedPoint, this.#apiService);
        this.#point = updatedPoint;
        this.#switchToDefaultMode();
      } else {
        await this.#model.addWaypoint(updatedPoint, this.#apiService);
        if (this.#onModeChange) {
          this.#onModeChange(null);
        }
      }
    } catch (err) {
      this.#editFormView.shake();
      this.#editFormView.setSaving(false);
    }
  }

  async #handleDeleteClick() {
    this.#editFormView.setDeleting(true);
    try {
      await this.#model.deleteWaypoint(this.#point.id, this.#apiService);
      this.destroy();
    } catch (err) {
      this.#editFormView.shake();
      this.#editFormView.setDeleting(false);
    }
  }

  async #handleFavoriteClick() {
    const updated = {...this.#point, isFavorite: !this.#point.isFavorite};
    try {
      await this.#model.updateWaypoint(updated, this.#apiService);
      this.#point = updated;
      const btn = this.#routePointView?.getElement()?.querySelector('.event__favorite-btn');
      if (btn) {
        btn.classList.toggle('event__favorite-btn--active', this.#point.isFavorite);
      }
    } catch (err) {
      this.#routePointView?.shake?.();
    }
  }

  #attachEscKeyListener() {
    this.#escKeyHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault(); this.#switchToDefaultMode();
      }
    };
    document.addEventListener('keyup', this.#escKeyHandler);
  }

  #removeEscKeyListener() {
    if (this.#escKeyHandler) {
      document.removeEventListener('keyup', this.#escKeyHandler);
      this.#escKeyHandler = null;
    }
  }
}
