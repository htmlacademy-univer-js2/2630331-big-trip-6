import Filter from './view/filter.js';
import Sort from './view/sort.js';
import TripEventsList from './view/tripEventsList.js';
import RoutePointView from './view/routePointView.js';
import EditFormView from './view/editFormView.js';
import EmptyListView from './view/emptyListView.js';
import { render, RenderPosition, replace } from './render.js';

export default class Presenter {
  #tripEventsList = new TripEventsList();
  #model = null;
  #pointViewMap = new Map();
  #editFormViewMap = new Map();
  #filterComponent = null;
  #sortComponent = null;

  constructor(model) {
    this.#model = model;
  }

  init() {
    const points = this.#model.getPoints();
    const eventsSection = document.querySelector('.trip-events');

    if (points.length === 0) {
      this.#renderEmpty(eventsSection);
      return;
    }

    this.#renderWithContent(points, eventsSection);
  }

  #renderEmpty(container) {
    const emptyListView = new EmptyListView();
    render(emptyListView, container);
  }

  #renderWithContent(points, eventsSection) {
    const filterContainer = document.querySelector('.trip-controls__filters');

    const filterStates = this.#computeFilterStates(points);
    this.#filterComponent = new Filter(filterStates, 'everything');
    render(this.#filterComponent, filterContainer);

    const sortStates = this.#computeSortStates();
    this.#sortComponent = new Sort(sortStates);
    render(this.#sortComponent, eventsSection, RenderPosition.BEFOREEND);

    render(this.#tripEventsList, eventsSection, RenderPosition.BEFOREEND);

    const tripList = document.querySelector('.trip-events__list');

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

  #computeFilterStates(points) {
    const now = new Date();

    const hasFuturePoints = points.some(point => new Date(point.dateFrom) > now);
    const hasPresentPoints = points.some(point => {
      const start = new Date(point.dateFrom);
      const end = new Date(point.dateTo);
      return start <= now && now <= end;
    });
    const hasPastPoints = points.some(point => new Date(point.dateTo) < now);

    return [
      { type: 'everything', label: 'Everything', isDisabled: false },
      { type: 'future', label: 'Future', isDisabled: !hasFuturePoints },
      { type: 'present', label: 'Present', isDisabled: !hasPresentPoints },
      { type: 'past', label: 'Past', isDisabled: !hasPastPoints }
    ];
  }

  #computeSortStates() {
    return [
      { type: 'day', label: 'Day', isDisabled: false, isActive: true },
      { type: 'event', label: 'Event', isDisabled: true, isActive: false },
      { type: 'time', label: 'Time', isDisabled: false, isActive: false },
      { type: 'price', label: 'Price', isDisabled: false, isActive: false },
      { type: 'offer', label: 'Offers', isDisabled: true, isActive: false }
    ];
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
