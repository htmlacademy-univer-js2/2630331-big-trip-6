const CITIES = ['Amsterdam', 'Geneva', 'Chamonix', 'Paris', 'Brussels', 'Cologne', 'Lyon'];

const OFFER_TITLES = {
  taxi: ['Order Uber', 'Rent a car', 'Book taxi online'],
  bus: ['Travel by bus', 'Book online ticket', 'Select seat'],
  train: ['Travel by train', 'Book tickets', 'Reserve berth'],
  ship: ['Upgrade to first class cabin', 'Add breakfast', 'Buy excursion'],
  drive: ['Rent a car', 'Add GPS', 'Book parking'],
  flight: ['Add luggage', 'Switch to comfort class', 'Add meal'],
  'check-in': ['Add hotel insurance', 'Book early check-in', 'Upgrade room'],
  sightseeing: ['Book tickets', 'Add audio guide', 'Join walking tour'],
  restaurant: ['Reserve table', 'Add wine pairing', 'Include dessert']
};

const DESCRIPTIONS = [
  'This amazing destination offers breathtaking views and rich cultural heritage.',
  'A vibrant city with excellent cuisine, art museums, and historic architecture.',
  'Perfect for adventure seekers with stunning natural landscapes.',
  'Known for its shopping district and world-class restaurants.',
  'A charming medieval town with cobblestone streets and local charm.'
];

const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDestinations() {
  return CITIES.map((name, index) => ({
    id: index + 1,
    name,
    description: getRandomElement(DESCRIPTIONS),
    pictures: Array.from({ length: 5 }, (_, i) => ({
      src: `https://loremflickr.com/248/152?random=${index * 5 + i + 1}`,
      description: `${name} photo`
    }))
  }));
}

function generateOffers() {
  const offers = [];
  let id = 1;

  POINT_TYPES.forEach(type => {
    const titles = OFFER_TITLES[type] || [];
    titles.forEach((title, index) => {
      offers.push({
        id: id++,
        type,
        title,
        price: getRandomInt(10, 150)
      });
    });
  });

  return offers;
}

function generateRoutePoints(destinations, offers, count = 3) {
  const points = [];

  for (let i = 0; i < count; i++) {
    const type = getRandomElement(POINT_TYPES);
    const destination = getRandomElement(destinations);
    const typeOffers = offers.filter(offer => offer.type === type);
    const selectedOffers = typeOffers.slice(0, getRandomInt(0, Math.min(2, typeOffers.length))).map(o => o.id);

    const dateFrom = new Date(2024, 2, 18 + i, 10 + i, 0);
    const dateTo = new Date(dateFrom.getTime() + getRandomInt(1, 6) * 60 * 60 * 1000);

    points.push({
      id: i + 1,
      type,
      destinationId: destination.id,
      basePrice: getRandomInt(50, 500),
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      offers: selectedOffers,
      isFavorite: Math.random() > 0.7
    });
  }

  return points;
}

function generateMockData() {
  const destinations = generateDestinations();
  const offers = generateOffers();
  const points = generateRoutePoints(destinations, offers);

  return {
    destinations,
    offers,
    points
  };
}

export { generateMockData };
