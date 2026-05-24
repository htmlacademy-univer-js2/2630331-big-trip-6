import Filter from './view/filter.js';
import Sort from './view/sort.js';
import TripEventsList from './view/tripEventsList.js';
import EmptyListView from './view/emptyListView.js';
import PointPresenter from './presenter/point-presenter.js';
import { render, RenderPosition } from './render.js';

export default class Presenter {
  #tripEventsList = new TripEventsList();
  #model = null;
  #pointPresenters = new Map();
  #filterComponent = null;
  #sortComponent = null;
  #currentEditingPointId = null;
  #currentSortType = 'day';
  #allPoints = [];
  #tripListContainer = null;

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
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange.bind(this));

    render(this.#tripEventsList, eventsSection, RenderPosition.BEFOREEND);

    this.#tripListContainer = document.querySelector('.trip-events__list');
    this.#allPoints = [...points];
    
    this.#renderPointsList(points);
  }

  #renderPoint(point, container) {
    const destinations = this.#buildDestinationsMap();
    const offers = this.#buildOffersMap();

    const pointPresenter = new PointPresenter(
      container,
      point,
      destinations,
      offers,
      this.#handleDataChange.bind(this),
      this.#handleModeChange.bind(this)
    );

    pointPresenter.init();
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #handleDataChange(point) {
    // Сохраняем изменения в модель
    this.#model.updatePoint(point);
  }

  #handleModeChange(pointId) {
    // Закрываем форму редактирования о другой точке, если она открыта
    if (this.#currentEditingPointId !== null && this.#currentEditingPointId !== pointId) {
      const prevPresenter = this.#pointPresenters.get(this.#currentEditingPointId);
      if (prevPresenter) {
        prevPresenter.resetMode();
      }
    }
    this.#currentEditingPointId = pointId;
  }

  #handleSortTypeChange(sortType) {
    this.#currentSortType = sortType;
    this.#rerenderPointsList();
  }

  #renderPointsList(points) {
    points.forEach(point => {
      this.#renderPoint(point, this.#tripListContainer);
    });
  }

  #rerenderPointsList() {
    const sortedPoints = this.#sortPoints(this.#allPoints);
    
    // Лучше переиспользовать существующий контейнер
    this.#tripListContainer.querySelectorAll('.event').forEach(el => {
      el.remove();
    });

    this.#pointPresenters.forEach(presenter => {
      presenter.destroy();
    });
    this.#pointPresenters.clear();

    this.#renderPointsList(sortedPoints);
  }

  #sortPoints(points) {
    const sortedPoints = [...points];

    switch (this.#currentSortType) {
      case 'day':
        return sortedPoints.sort((a, b) => {
          const dateA = new Date(a.dateFrom);
          const dateB = new Date(b.dateFrom);
          return dateA - dateB;
        });

      case 'time':
        return sortedPoints.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });

      case 'price':
        return sortedPoints.sort((a, b) => b.basePrice - a.basePrice);

      case 'event':
      case 'offer':
        // Эти сортировки отключены в UI
        return sortedPoints;

      default:
        return sortedPoints;
    }
  }

  #buildDestinationsMap() {
    const destinations = new Map();
    const allDestinations = this.#model.getDestinations();

    allDestinations.forEach(dest => {
      destinations.set(dest.id, dest);
    });

    return destinations;
  }

  #buildOffersMap() {
    const offers = new Map();
    const allOffers = this.#model.getOffers();

    allOffers.forEach(offer => {
      offers.set(offer.id, offer);
    });

    return offers;
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
}

