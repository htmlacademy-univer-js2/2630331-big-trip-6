import TripInfoView from '../view/tripInfoView.js';
import dayjs from 'dayjs';

/**
 * TripInfoPresenter - Manages trip information display (route, dates, total cost)
 */
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
    
    // Subscribe to model changes
    this.#model.addObserver(() => this.#onModelChange());
  }

  #renderTripInfo() {
    const points = this.#model.getPoints();
    
    if (points.length === 0) {
      // Clear trip info if no points
      const existing = this.#container.querySelector('.trip-info');
      if (existing) {
        existing.remove();
      }
      return;
    }

    // Calculate route
    const route = this.#calculateRoute(points);

    // Calculate dates
    const { startDate, endDate } = this.#calculateDates(points);

    // Calculate total cost
    const totalCost = this.#calculateTotalCost(points);

    // Update view
    this.#view.updateData(route, startDate, endDate, totalCost);

    // Insert into DOM if not already there
    const existing = this.#container.querySelector('.trip-info');
    const element = this.#view.render();

    if (!element) {
      // No element to render (shouldn't happen with points)
      return;
    }

    if (existing) {
      existing.replaceWith(element);
    } else {
      // Insert after logo
      const logo = this.#container.querySelector('.page-header__logo');
      if (logo) {
        logo.parentNode.insertBefore(element, logo.nextSibling);
      }
    }
  }

  /**
   * Calculate trip route title from waypoint destinations
   * Format: "City1 — City2 — City3" (max 3 cities)
   * If more than 3: "City1 — ... — City3"
   * @private
   * @param {Array} points - Sorted waypoints
   * @returns {string} Route title
   */
  #calculateRoute(points) {
    // Sort by dateFrom
    const sorted = [...points].sort((a, b) => {
      return new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime();
    });

    const destinations = sorted
      .map(p => p.destinationName || `Destination ${p.destinationId}`)
      .filter(Boolean);

    if (destinations.length === 0) {
      return '';
    }

    if (destinations.length <= 3) {
      return destinations.join(' — ');
    }

    return `${destinations[0]} — ... — ${destinations[destinations.length - 1]}`;
  }

  /**
   * Calculate start and end dates for the trip
   * @private
   * @param {Array} points - Waypoints
   * @returns {Object} Object with startDate and endDate as formatted strings
   */
  #calculateDates(points) {
    // Sort by dateFrom
    const sorted = [...points].sort((a, b) => {
      return new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime();
    });

    const start = sorted[0]?.dateFrom;
    const end = sorted[sorted.length - 1]?.dateTo;

    if (!start || !end) {
      return { startDate: '', endDate: '' };
    }

    const startDate = dayjs(start);
    const endDate = dayjs(end);

    // Format: "MMM DD"
    const startFormatted = startDate.format('MMM DD');
    const endFormatted = endDate.format('MMM DD');

    // If same month, show "Mar 18 — 24", else "Mar 18 — Apr 02"
    if (startDate.month() === endDate.month()) {
      return {
        startDate: startFormatted,
        endDate: endDate.format('DD')
      };
    }

    return {
      startDate: startFormatted,
      endDate: endFormatted
    };
  }

  /**
   * Calculate total trip cost (base price + offers)
   * @private
   * @param {Array} points - Waypoints
   * @returns {number} Total cost in euros
   */
  #calculateTotalCost(points) {
    return points.reduce((total, point) => {
      const basePrice = point.basePrice || 0;

      // Calculate cost of selected offers
      let offersCost = 0;
      if (point.offers) {
        if (point.offers instanceof Set) {
          // If offers is a Set of offer IDs, get the offer objects from model
          const offersMap = new Map(
            this.#model.getOffers().map(o => [o.id, o])
          );
          point.offers.forEach(offerId => {
            const offer = offersMap.get(offerId);
            if (offer) {
              offersCost += offer.price || 0;
            }
          });
        } else if (Array.isArray(point.offers)) {
          // If offers is an array of offer objects
          offersCost = point.offers.reduce((sum, offer) => {
            return sum + (offer.price || 0);
          }, 0);
        }
      }

      return total + basePrice + offersCost;
    }, 0);
  }

  #onModelChange() {
    this.#renderTripInfo();
  }
}
