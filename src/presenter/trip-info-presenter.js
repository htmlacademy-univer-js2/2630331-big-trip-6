import TripInfoView from '../view/tripInfoView.js';
import dayjs from 'dayjs';

export default class TripInfoPresenter {
  #container;
  #model;
  #view;

  constructor(container, model) {
    this.#container = container;
    this.#model = model;
    this.#view = new TripInfoView();
  }

  init() {
    this.#renderTripInfo();
    this.#model.addObserver(() => this.#renderTripInfo());
  }

  #renderTripInfo() {
    const points = this.#model.getPoints();
    const existing = this.#container.querySelector('.trip-info');

    if (points.length === 0) {
      if (existing) {
        existing.remove();
      }
      return;
    }

    const dests = this.#model.getDestinations();
    const destMap = new Map(dests.map((d) => [d.id, d]));
    const sorted = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    const destNames = sorted.map((p) => destMap.get(p.destinationId)?.name || '').filter(Boolean);
    let route = '';
    if (destNames.length <= 3) {
      route = destNames.join(' — ');
    } else {
      route = `${destNames[0] } — ... — ${ destNames[destNames.length - 1]}`;
    }

    const startDate = sorted[0]?.dateFrom;
    const endDate = sorted[sorted.length - 1]?.dateTo;
    const startD = dayjs(startDate);
    const endD = dayjs(endDate);
    const startFormatted = startD.format('DD MMM').toUpperCase();
    const endFormatted = startD.month() === endD.month() ? endD.format('DD MMM').toUpperCase() : endD.format('DD MMM').toUpperCase();

    const offersFlat = new Map();
    this.#model.getOffers().forEach((g) => g.offers.forEach((o) => offersFlat.set(o.id, o)));
    const totalCost = points.reduce((sum, p) => {
      const offersCost = (p.offers || []).reduce((s, id) => s + (offersFlat.get(id)?.price || 0), 0);
      return sum + (p.basePrice || 0) + offersCost;
    }, 0);

    this.#view.updateData(route, startFormatted, endFormatted, totalCost);
    const element = this.#view.render();
    if (!element) {
      return;
    }

    if (existing) {
      existing.replaceWith(element);
    } else {
      const controls = this.#container.querySelector('.trip-controls');
      if (controls) {
        this.#container.insertBefore(element, controls);
      } else {
        this.#container.prepend(element);
      }
    }
  }
}
