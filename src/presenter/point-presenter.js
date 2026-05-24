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
  #mode = 'default'; // 'default' or 'edit'
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
    this.#renderPoint();
  }

  #renderPoint() {
    const destination = this.#destinations.get(this.#point.destinationId);
    const pointOffers = Array.from(this.#point.offers || [])
      .map(offerId => this.#offers.get(offerId))
      .filter(Boolean);
    const availableOffers = Array.from(this.#offers.values())
      .filter(offer => offer.type === this.#point.type);

    const prevPointView = this.#routePointView;
    const prevEditFormView = this.#editFormView;

    this.#routePointView = new RoutePointView(this.#point, destination, pointOffers);
    this.#editFormView = new EditFormView(this.#point, destination, availableOffers);

    this.#setPointViewHandlers();
    this.#setEditFormHandlers();

    if (this.#mode === 'default') {
      if (prevPointView) {
        replace(this.#routePointView, prevPointView);
      } else {
        this.#container.appendChild(this.#routePointView.getElement());
      }
    } else {
      if (prevEditFormView) {
        replace(this.#editFormView, prevEditFormView);
      } else {
        this.#container.appendChild(this.#editFormView.getElement());
      }
    }
  }

  #setPointViewHandlers() {
    this.#routePointView.setEditClickHandler(() => this.#switchToEditMode());
    this.#routePointView.setFavoriteClickHandler(() => this.#handleFavoriteClick());
  }

  #setEditFormHandlers() {
    this.#editFormView.setFormSubmitHandler(() => this.#handleFormSubmit());
    this.#editFormView.setRollupClickHandler(() => this.#handleRollupClick());
  }

  #switchToEditMode() {
    replace(this.#editFormView, this.#routePointView);
    this.#mode = 'edit';
    this.#onModeChange(this.#point.id);
    this.#attachEscKeyListener();
  }

  #switchToDefaultMode() {
    replace(this.#routePointView, this.#editFormView);
    this.#mode = 'default';
    this.#removeEscKeyListener();
  }

  async #handleFormSubmit() {
    // Get the updated data from the form view
    const formState = this.#editFormView.getState();

    // Merge form state with original point data
    const updatedPoint = {
      ...this.#point,
      type: formState.type,
      dateFrom: formState.dateFrom,
      dateTo: formState.dateTo,
      basePrice: formState.basePrice,
      offers: new Set(formState.selectedOffers || [])
    };

    // Show saving state
    this.#editFormView.setSaving(true);

    try {
      // Call the model with async API sync
      await this.#model.updateWaypoint(updatedPoint, this.#apiService);

      // Update internal point reference
      this.#point = updatedPoint;

      // Switch back to default view
      this.#switchToDefaultMode();
    } catch (error) {
      console.error('Failed to save point:', error);
      // Show error feedback
      this.#editFormView.shake();
      this.#editFormView.setSaving(false);
    }
  }

  #handleRollupClick() {
    if (this.#mode === 'edit') {
      // In edit mode: delete the point
      this.#handleDeleteClick();
    } else {
      // In default mode: just close
      this.#switchToDefaultMode();
    }
  }

  async #handleDeleteClick() {
    // Show deleting state
    this.#editFormView.setDeleting(true);

    try {
      // Call the model with async API sync
      await this.#model.deleteWaypoint(this.#point.id, this.#apiService);

      // Point was deleted, remove it from DOM
      this.destroy();
    } catch (error) {
      console.error('Failed to delete point:', error);
      // Show error feedback
      this.#editFormView.shake();
      this.#editFormView.setDeleting(false);
    }
  }

  #handleFavoriteClick() {
    this.#point.isFavorite = !this.#point.isFavorite;
    this.#onDataChange(this.#point);
    // Перерисовка только кнопки избранного (partial data binding)
    this.#renderFavoriteButton();
  }

  #renderFavoriteButton() {
    const pointElement = this.#routePointView.getElement();
    const favoriteBtn = pointElement.querySelector('.event__favorite-btn');

    if (favoriteBtn) {
      if (this.#point.isFavorite) {
        favoriteBtn.classList.add('event__favorite-btn--active');
      } else {
        favoriteBtn.classList.remove('event__favorite-btn--active');
      }
    }
  }

  #attachEscKeyListener() {
    this.#escKeyHandler = (evt) => {
      if (evt.key === 'Escape') {
        this.#switchToDefaultMode();
      }
    };
    document.addEventListener('keydown', this.#escKeyHandler);
  }

  #removeEscKeyListener() {
    if (this.#escKeyHandler) {
      document.removeEventListener('keydown', this.#escKeyHandler);
      this.#escKeyHandler = null;
    }
  }

  destroy() {
    this.#removeEscKeyListener();
    if (this.#routePointView) {
      this.#routePointView.getElement().remove();
    }
    if (this.#editFormView) {
      this.#editFormView.getElement().remove();
    }
  }

  resetMode() {
    if (this.#mode === 'edit') {
      this.#switchToDefaultMode();
    }
  }

  getPointId() {
    return this.#point.id;
  }
}
