export default class PointsModel {
  constructor() {
    this.points = [];
    this.destinations = [];
    this.offers = [];
  }

  initialize(data) {
    this.points = data.points;
    this.destinations = data.destinations;
    this.offers = data.offers;
  }

  getPoints() {
    return this.points;
  }

  getDestinations() {
    return this.destinations;
  }

  getOffers() {
    return this.offers;
  }

  getDestinationById(id) {
    return this.destinations.find(destination => destination.id === id);
  }

  getOffersByIds(offerIds) {
    if (!offerIds || offerIds.length === 0) {
      return [];
    }
    return this.offers.filter(offer => offerIds.includes(offer.id));
  }

  getOffersByType(type) {
    return this.offers.filter(offer => offer.type === type);
  }
}
