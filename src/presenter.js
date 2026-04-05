import Filter from './view/filter.js';
import Sort from './view/sort.js';
import TripEventsList from './view/tripEventsList.js';
import RoutePointView from './view/routePointView.js';
import EditFormView from './view/editFormView.js';
import { render, RenderPosition, replace } from './render.js';

export default class Presenter {
  #filter = new Filter();
  #sort = new Sort();
  #tripEventsList = new TripEventsList();
  #model = null;
  #pointViewMap = new Map();
  #editFormViewMap = new Map();

  constructor(model) {
    this.#model = model;
  }

  init() {
    const filterContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');
    const tripList = document.querySelector('.trip-events__list');

    render(this.#filter, filterContainer);
    render(this.#sort, eventsSection, RenderPosition.BEFOREEND);
    render(this.#tripEventsList, eventsSection, RenderPosition.BEFOREEND);

    const points = this.#model.getPoints();

    points.forEach(point => {
      this.#renderPoint(point, tripList);
    });
  }

  #renderPoint(point, container) {
    const destination = this.#model.getDestinationById(point.destinationId);
    const pointOffers = this.#model.getOffersByIds(point.offers);
    const availableOffers = this.#model.getOffersByType(point.type);

    const routePointView = new RoutePointView(point, destination, pointOffers);
    const editFormView = new EditFormView(point, destination, availableOffers);

    this.#pointViewMap.set(point.id, routePointView);
    this.#editFormViewMap.set(point.id, editFormView);

    const handleEditClick = () => {
      replace(editFormView, routePointView);
      this.#addEscKeyListener(point.id, () => this.#closeEditForm(point.id, container));
    };

    const handleFormSubmit = () => {
      replace(routePointView, editFormView);
      this.#removeEscKeyListener();
    };

    const handleRollupClick = () => {
      replace(routePointView, editFormView);
      this.#removeEscKeyListener();
    };

    routePointView.setEditClickHandler(handleEditClick);
    editFormView.setFormSubmitHandler(handleFormSubmit);
    editFormView.setRollupClickHandler(handleRollupClick);

    render(routePointView, container);
  }

  #closeEditForm(pointId, container) {
    const routePointView = this.#pointViewMap.get(pointId);
    const editFormView = this.#editFormViewMap.get(pointId);

    if (routePointView && editFormView) {
      replace(routePointView, editFormView);
    }

    this.#removeEscKeyListener();
  }

  #escKeyListener = null;

  #addEscKeyListener(pointId, callback) {
    if (this.#escKeyListener) {
      document.removeEventListener('keydown', this.#escKeyListener);
    }

    this.#escKeyListener = (evt) => {
      if (evt.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', this.#escKeyListener);
  }

  #removeEscKeyListener() {
    if (this.#escKeyListener) {
      document.removeEventListener('keydown', this.#escKeyListener);
      this.#escKeyListener = null;
    }
  }
}
