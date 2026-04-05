import Filter from './view/filter.js';
import Sort from './view/sort.js';
import EventForm from './view/eventForm.js';
import Event from './view/event.js';
import TripEventsList from './view/tripEventsList.js';
import { render, RenderPosition } from './render.js';

export default class Presenter {
  constructor() {
    this.filter = new Filter();
    this.sort = new Sort();
    this.eventForm = new EventForm({
      destination: 'Geneva',
      startTime: '19/03/19 00:00',
      endTime: '19/03/19 00:00',
      price: ''
    });
    this.tripEventsList = new TripEventsList();

    this.events = [
      {
        date: 'MAR 18',
        dateTime: '2019-03-18',
        typeIcon: 'taxi',
        title: 'Taxi Amsterdam',
        startTime: '10:30',
        endTime: '11:00',
        startDateTime: '2019-03-18T10:30',
        endDateTime: '2019-03-18T11:00',
        duration: '30M',
        price: '20',
        offers: [
          { title: 'Order Uber', price: '20' }
        ]
      },
      {
        date: 'MAR 18',
        dateTime: '2019-03-18',
        typeIcon: 'flight',
        title: 'Flight Chamonix',
        startTime: '12:25',
        endTime: '13:35',
        startDateTime: '2019-03-18T12:25',
        endDateTime: '2019-03-18T13:35',
        duration: '01H 10M',
        price: '160',
        offers: []
      },
      {
        date: 'MAR 18',
        dateTime: '2019-03-18',
        typeIcon: 'drive',
        title: 'Drive Chamonix',
        startTime: '14:30',
        endTime: '16:30',
        startDateTime: '2019-03-18T14:30',
        endDateTime: '2019-03-18T16:30',
        duration: '02H',
        price: '50',
        offers: []
      }
    ];
  }

  init() {
    const filterContainer = document.querySelector('.trip-controls__filters');
    const eventsSection = document.querySelector('.trip-events');

    render(this.filter, filterContainer);
    render(this.sort, eventsSection, RenderPosition.BEFOREEND);
    render(this.tripEventsList, eventsSection, RenderPosition.BEFOREEND);

    const tripList = document.querySelector('.trip-events__list');

    const eventFormItem = document.createElement('li');
    eventFormItem.classList.add('trip-events__item');
    eventFormItem.appendChild(this.eventForm.getElement());
    tripList.appendChild(eventFormItem);

    this.events.forEach(eventData => {
      const event = new Event(eventData);
      const eventItem = document.createElement('li');
      eventItem.classList.add('trip-events__item');
      eventItem.appendChild(event.getElement());
      tripList.appendChild(eventItem);
    });
  }
}


// надеюсь коммит сработает
