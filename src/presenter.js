import Filter from './view/filter.js';
import Sort from './view/sort.js';
import PointPresenter from './presenter/point-presenter.js';
import TripEventsList from './view/tripEventsList.js';
import { render, RenderPosition } from './render.js';
import { getFilterStats, getDisabledFilters, filterPoints, FilterType } from './utils/filter-utils.js';

export default class Presenter {
  #model;
  #apiService;
  #filter;
  #sort;
  #tripEventsList;
  #pointPresenters = [];
  #currentOpenPointId = null;
  #currentFilter = FilterType.EVERYTHING;
  #currentSort = "sort-day";
  #newEventPresenter = null;
  #destinationsMap = new Map();
  #offersMap = new Map();

  constructor(model, apiService) {
    this.#model = model;
    this.#apiService = apiService;
    this.#filter = new Filter();
    this.#sort = new Sort();
    this.#tripEventsList = new TripEventsList();
  }

  init() {
    const filterContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');
    eventsSection.innerHTML = '';
    render(this.#filter, filterContainer);
    this.#updateFilterStates();
    render(this.#sort, eventsSection, RenderPosition.BEFOREEND);
    render(this.#tripEventsList, eventsSection, RenderPosition.BEFOREEND);
    this.#buildDataMaps();
    this.#renderPoints();
    this.#filter.setFilterChangeHandler((filterType) => this.#handleFilterChange(filterType));
    this.#filter._activeFilter = 'everything';
    this.#sort.setSortChangeHandler((sortType) => this.#handleSortChange(sortType));
    this.#model.addObserver(() => this.#onModelChange());
    const newEventBtn = document.querySelector('.trip-main__event-add-btn');
    this._newEventBtn = newEventBtn;
    if (newEventBtn) {
      newEventBtn.addEventListener('click', (evt) => { if (evt.detail === 0) return; this.#handleNewEventClick(); });
    }
  }

  #buildDataMaps() {
    this.#destinationsMap = new Map(this.#model.getDestinations().map(d => [d.id, d]));
    this.#offersMap = new Map();
    this.#model.getOffers().forEach(offerGroup => {
      offerGroup.offers.forEach(offer => {
        this.#offersMap.set(offer.id, {...offer, type: offerGroup.type});
      });
    });
  }

  #renderPoints() {
    const tripList = this.#tripEventsList.getElement();
    tripList.innerHTML = '';
    const points = this.#sortPoints(filterPoints(this.#model.getPoints(), this.#currentFilter));
    if (points.length === 0) {
      if (this.#newEventPresenter) { return; }
      const messages = {
        everything: "Click New Event to create your first point",
        future: "There are no future events now",
        present: "There are no present events now",
        past: "There are no past events now"
      };
      tripList.innerHTML = `<p class="trip-events__msg">${messages[this.#currentFilter] || messages.everything}</p>`;
    } else {
      points.forEach(point => this.#renderPoint(point, tripList));
    }
  }

  #renderPoint(point, tripList) {
    const li = document.createElement('li');
    li.className = 'trip-events__item';
    tripList.appendChild(li);
    const pointPresenter = new PointPresenter(
      li, point,
      this.#destinationsMap, this.#offersMap,
      (updatedPoint) => this.#handlePointChange(updatedPoint),
      (pointId) => this.#handleModeChange(pointId),
      this.#model, this.#apiService
    );
    pointPresenter.init();
    this.#pointPresenters.push(pointPresenter);
  }

  #handlePointChange(updatedPoint) {
    this.#model.updatePoint(updatedPoint);
  }

  #handleModeChange(pointId) {
    if (pointId === null) {
      this.#newEventPresenter = null;
      if (this._newEventBtn) { this._newEventBtn.disabled = false; }
      return;
    }
    if (this.#newEventPresenter) {
      this.#newEventPresenter.resetMode?.();
      this.#newEventPresenter = null;
      if (this._newEventBtn) { this._newEventBtn.disabled = false; }
    }
    if (this.#currentOpenPointId !== null && this.#currentOpenPointId !== pointId) {
      const other = this.#pointPresenters.find(pp2 => pp2.getPointId?.() === this.#currentOpenPointId);
      if (other) { other.resetMode?.(); }
    }
    this.#currentOpenPointId = pointId;
  }

  #handleNewEventClick() {
    if (this.#newEventPresenter) { return; }
    if (this._newEventBtn) { this._newEventBtn.disabled = true; }
    // Close any open edit form
    if (this.#currentOpenPointId !== null) {
      const other = this.#pointPresenters.find(pp2 => pp2.getPointId?.() === this.#currentOpenPointId);
      if (other) { other.resetMode?.(); }
      this.#currentOpenPointId = null;
    }
    // Reset filter and sort
    this.#currentFilter = FilterType.EVERYTHING;
    this.#currentSort = 'sort-day';
    this.#sort.resetSort();
    if (this.#filter) { this.#filter._activeFilter = FilterType.EVERYTHING; }
    this.#updateFilterStates();
    // Re-render all points (closes any open forms via destroy)
    this.#pointPresenters.forEach(pp2 => pp2.destroy?.());
    this.#pointPresenters = [];
    this.#renderPoints();
    // Remove empty message if present
    const tripList = this.#tripEventsList.getElement();
    const msg = tripList.querySelector('.trip-events__msg');
    if (msg) { msg.remove(); }
    // Create new event li
    const li = document.createElement('li');
    li.className = 'trip-events__item';
    tripList.prepend(li);
    const emptyPoint = { type: 'flight', dateFrom: null, dateTo: null, basePrice: 0, offers: [], isFavorite: false };
    const newPresenter = new PointPresenter(
      li, emptyPoint, this.#destinationsMap, this.#offersMap,
      (updatedPoint) => this.#handlePointChange(updatedPoint),
      (pointId) => this.#handleModeChange(pointId),
      this.#model, this.#apiService
    );
    newPresenter.init();
    newPresenter.openEditForm();
    this.#newEventPresenter = newPresenter;
    this.#pointPresenters.push(newPresenter);
  }
  #sortPoints(points) {
    switch(this.#currentSort) {
      case "sort-price": return [...points].sort((a, b) => b.basePrice - a.basePrice);
      case "sort-time": return [...points].sort((a, b) => (new Date(b.dateTo) - new Date(b.dateFrom)) - (new Date(a.dateTo) - new Date(a.dateFrom)));
      default: return [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    }
  }

  #handleSortChange(sortType) {
    this.#currentSort = sortType;
    this.#pointPresenters.forEach(p => p.destroy?.());
    this.#pointPresenters = [];
    this.#renderPoints();
  }

  #handleFilterChange(filterType) {
    this.#currentFilter = filterType;
    this.#currentSort = "sort-day";
    this.#sort.resetSort();
    this.#pointPresenters.forEach(p => p.destroy?.());
    this.#pointPresenters = [];
    this.#currentOpenPointId = null;
    this.#renderPoints();
  }

  #updateFilterStates() {
    const points = this.#model.getPoints();
    const filterStats = getFilterStats(points);
    const disabledFilters = getDisabledFilters(filterStats);
    this.#filter.updateDisabledFilters(disabledFilters);
  }

  clearNewEventPresenter() {
    this.#newEventPresenter = null;
  }

  #onModelChange() {
    this.#newEventPresenter = null;
    if (this._newEventBtn) { this._newEventBtn.disabled = false; }
    this.#currentOpenPointId = null;
    this.#currentOpenPointId = null;
    this.#updateFilterStates();
    this.#pointPresenters.forEach(p => p.destroy?.());
    this.#pointPresenters = [];
    this.#currentOpenPointId = null;
    this.#renderPoints();
  }
}