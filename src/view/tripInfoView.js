/**
 * TripInfoView - Displays trip route, dates, and total cost
 */
export default class TripInfoView {
  #element = null;
  #data = {
    route: '',
    startDate: '',
    endDate: '',
    totalCost: 0
  };

  constructor() {
    this.#element = null;
  }

  getTemplate() {
    const { route, startDate, endDate, totalCost } = this.#data;

    if (!route) {
      return '';
    }

    return `<section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${route}</h1>
        <p class="trip-info__dates">${startDate}&nbsp;—&nbsp;${endDate}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>`;
  }

  getElement() {
    if (!this.#element) {
      const div = document.createElement('div');
      const template = this.getTemplate();
      if (template) {
        div.innerHTML = template;
        this.#element = div.firstElementChild;
      }
    }
    return this.#element;
  }

  /**
   * Update trip info data and re-render
   * @param {string} route - Route title (e.g., "Paris — Vienna — Sophia")
   * @param {string} startDate - Formatted start date (e.g., "Mar 18")
   * @param {string} endDate - Formatted end date (e.g., "Mar 24")
   * @param {number} totalCost - Total trip cost in euros
   */
  updateData(route, startDate, endDate, totalCost) {
    this.#data = { route, startDate, endDate, totalCost };

    const template = this.getTemplate();
    if (!template) {
      // If no route, clear the element
      if (this.#element && this.#element.parentNode) {
        this.#element.remove();
      }
      this.#element = null;
      return;
    }

    if (this.#element) {
      const newDiv = document.createElement('div');
      newDiv.innerHTML = template;
      const newElement = newDiv.firstElementChild;
      this.#element.replaceWith(newElement);
      this.#element = newElement;
    } else {
      const newDiv = document.createElement('div');
      newDiv.innerHTML = template;
      this.#element = newDiv.firstElementChild;
    }
  }

  /**
   * Get the DOM element, creating it if needed
   */
  render() {
    return this.getElement();
  }
}
