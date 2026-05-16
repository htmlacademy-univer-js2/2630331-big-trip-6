export default class PointsModel {
  #points = [];
  #destinations = [];
  #offers = [];

  initialize(data) {
    this.#points = data.points || [];
    this.#destinations = data.destinations || [];
    this.#offers = data.offers || [];
  }

  getPoints() {
    return this.#points;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffers() {
    return this.#offers;
  }

  getDestinationById(id) {
    return this.#destinations.find(dest => dest.id === id);
  }

  getOffersByIds(offerIds) {
    return offerIds
      .map(offerId => this.#offers.find(offer => offer.id === offerId))
      .filter(Boolean);
  }

  getOffersByType(type) {
    return this.#offers.filter(offer => offer.type === type);
  }

  updatePoint(updatedPoint) {
    const index = this.#points.findIndex(point => point.id === updatedPoint.id);
    if (index !== -1) {
      this.#points[index] = updatedPoint;
    }
  }
}
