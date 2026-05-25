import Filter from './view/filter.js';
import Sort from './view/sort.js';
import PointPresenter from './presenter/point-presenter.js';
import TripEventsList from './view/tripEventsList.js';
import EmptyListView from './view/emptyListView.js';
import PointPresenter from './presenter/point-presenter.js';
import { render, RenderPosition } from './render.js';
import { getFilterStats, getDisabledFilters } from './utils/filter-utils.js';

export default class Presenter {
  #model;
  #apiService;
  #filter;
  #sort;
  #tripEventsList;
  #pointPresenters = [];
  #currentOpenPointId = null;
  #filterContainer;

  constructor(model, apiService) {
    this.#model = model;
    this.#apiService = apiService;
    this.#filter = new Filter();
    this.#sort = new Sort();
    this.#tripEventsList = new TripEventsList();
  }

  init() {
    this.#filterContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');

    // Clear loading state
    eventsSection.innerHTML = '';

    // Render UI components
    render(this.#filter, this.#filterContainer);
    this.#updateFilterStates();
    
    render(this.#sort, eventsSection, RenderPosition.BEFOREEND);
    render(this.#tripEventsList, eventsSection, RenderPosition.BEFOREEND);

    // Get the list container
    const tripList = this.#tripEventsList.getElement();

    // Build data structures for easier lookup
    const destinationsMap = new Map(
      this.#model.getDestinations().map(d => [d.id, d])
    );
    const offersMap = new Map(
      this.#model.getOffers().map(o => [o.id, o])
    );

    // Render each point
    const points = this.#model.getPoints();
    if (points.length === 0) {
      eventsSection.innerHTML += '<p class="trip-events__msg">No trip events yet</p>';
    } else {
      points.forEach(point => {
        this.#renderPoint(point, tripList, destinationsMap, offersMap);
      });
    }

    // Subscribe to model changes
    this.#model.addObserver(() => this.#onModelChange());
  }

  #renderPoint(point, container, destinationsMap, offersMap) {
    const pointPresenter = new PointPresenter(
      container,
      point,
      destinationsMap,
      offersMap,
      (updatedPoint) => this.#handlePointChange(updatedPoint),
      (pointId) => this.#handleModeChange(pointId),
      this.#model,
      this.#apiService
    );

    pointPresenter.init();
    this.#pointPresenters.push(pointPresenter);
  }

  #handlePointChange(updatedPoint) {
    // This is called for favorite toggle or other non-async updates
    // For form submit, the PointPresenter handles it directly
    this.#model.updatePoint(updatedPoint);
  }

  #handleModeChange(pointId) {
    // Close other open points
    if (this.#currentOpenPointId !== null && this.#currentOpenPointId !== pointId) {
      const otherPresenter = this.#pointPresenters.find(
        p => p.getPointId && p.getPointId() === this.#currentOpenPointId
      );
      if (otherPresenter && otherPresenter.resetMode) {
        otherPresenter.resetMode();
      }
    }
    this.#currentOpenPointId = pointId;
  }

  #updateFilterStates() {
    const points = this.#model.getPoints();
    const filterStats = getFilterStats(points);
    const disabledFilters = getDisabledFilters(filterStats);
    this.#filter.updateDisabledFilters(disabledFilters);
  }

  #onModelChange() {
    // Update filter states
    this.#updateFilterStates();
    
    // Refresh the entire list when model changes
    // This is a simple approach - in a real app, you might do partial updates
    this.#pointPresenters.forEach(p => p.destroy?.());
    this.#pointPresenters = [];
    this.init();
  }
}
