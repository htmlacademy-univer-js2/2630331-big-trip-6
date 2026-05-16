import RoutePointView from '../view/routePointView.js';
import EditFormView from '../view/editFormView.js';
import { replace } from '../render.js';

export default class PointPresenter {
  #container = null;
  #point = null;
  #destinations = null;
  #offers = null;
  #onDataChange = null;
  #onModeChange = null;

  #routePointView = null;
  #editFormView = null;
  #mode = 'default'; // 'default' or 'edit'
  #escKeyHandler = null;

  constructor(container, point, destinations, offers, onDataChange, onModeChange) {
    this.#container = container;
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
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
    this.#editFormView.setRollupClickHandler(() => this.#switchToDefaultMode());
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

  #handleFormSubmit() {
    this.#switchToDefaultMode();
    // Здесь можно добавить логику сохранения данных
    this.#onDataChange(this.#point);
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
  }

  resetMode() {
    if (this.#mode === 'edit') {
      this.#switchToDefaultMode();
    }
  }
}
