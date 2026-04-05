import Filter from './view/filter.js';
import Sort from './view/sort.js';
import EventForm from './view/eventForm.js';
import Event from './view/event.js';
import TripEventsList from './view/tripEventsList.js';
import { render, RenderPosition } from './render.js';

export default class Presenter {
  constructor(model) {
    this.model = model;
    this.filter = new Filter();
    this.sort = new Sort();
    this.tripEventsList = new TripEventsList();
  }

  init() {
    const filterContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');
    const tripList = document.querySelector('.trip-events__list');

    render(this.filter, filterContainer);
    render(this.sort, eventsSection, RenderPosition.BEFOREEND);
    render(this.tripEventsList, eventsSection, RenderPosition.BEFOREEND);

    const points = this.model.getPoints();
    const destinations = this.model.getDestinations();
    const offers = this.model.getOffers();

    if (points.length > 0) {
      const firstPoint = points[0];
      const firstDestination = this.model.getDestinationById(firstPoint.destinationId);
      const firstPointOffers = this.model.getOffersByIds(firstPoint.offers);
      const availableOffers = this.model.getOffersByType(firstPoint.type);

      const eventForm = new EventForm(firstPoint, firstDestination, availableOffers);
      const eventFormItem = document.createElement('li');
      eventFormItem.classList.add('trip-events__item');
      eventFormItem.appendChild(eventForm.getElement());
      tripList.appendChild(eventFormItem);
    }

    points.forEach(point => {
      const destination = this.model.getDestinationById(point.destinationId);
      const pointOffers = this.model.getOffersByIds(point.offers);

      const event = new Event(point, destination, pointOffers);
      const eventItem = document.createElement('li');
      eventItem.classList.add('trip-events__item');
      eventItem.appendChild(event.getElement());
      tripList.appendChild(eventItem);
    });
  }
}
