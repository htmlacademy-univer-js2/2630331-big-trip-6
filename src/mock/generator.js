import dayjs from 'dayjs';

const DESTINATIONS = [
  {
    id: '1',
    name: 'Amsterdam',
    description: 'Amsterdam is the capital and most populous city of the Netherlands.',
    pictures: [
      {
        src: 'img/photos/1.jpg',
        description: 'Amsterdam cityscape'
      }
    ]
  },
  {
    id: '2',
    name: 'Geneva',
    description: 'Geneva is a city in Switzerland, at the southern tip of Lake Geneva.',
    pictures: [
      {
        src: 'img/photos/2.jpg',
        description: 'Geneva waterfront'
      }
    ]
  },
  {
    id: '3',
    name: 'Chamonix',
    description: 'Chamonix is a French Alpine resort town.',
    pictures: [
      {
        src: 'img/photos/3.jpg',
        description: 'Chamonix mountains'
      }
    ]
  },
  {
    id: '4',
    name: 'Paris',
    description: 'Paris is the capital and most populous city of France.',
    pictures: [
      {
        src: 'img/photos/4.jpg',
        description: 'Eiffel Tower'
      }
    ]
  },
  {
    id: '5',
    name: 'Brussels',
    description: 'Brussels is the capital of Belgium.',
    pictures: [
      {
        src: 'img/photos/5.jpg',
        description: 'Grand Place'
      }
    ]
  }
];

const OFFERS = [
  {
    id: '1',
    type: 'taxi',
    title: 'Upgrade to a business class',
    price: 120
  },
  {
    id: '2',
    type: 'bus',
    title: 'Order meal',
    price: 10
  },
  {
    id: '3',
    type: 'train',
    title: 'Book a ticket',
    price: 50
  },
  {
    id: '4',
    type: 'flight',
    title: 'Add luggage',
    price: 25
  },
  {
    id: '5',
    type: 'flight',
    title: 'Switch to comfort class',
    price: 200
  },
  {
    id: '6',
    type: 'check-in',
    title: 'Add breakfast',
    price: 15
  },
  {
    id: '7',
    type: 'sightseeing',
    title: 'Book tickets',
    price: 30
  },
  {
    id: '8',
    type: 'restaurant',
    title: 'Order wine',
    price: 18
  },
  {
    id: '9',
    type: 'drive',
    title: 'Add insurance',
    price: 50
  },
  {
    id: '10',
    type: 'ship',
    title: 'Upgrade cabin',
    price: 100
  }
];

const EVENT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count = 3) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateMockData() {
  const start = dayjs().toDate();
  const end = dayjs().add(7, 'day').toDate();

  const points = [];
  for (let i = 0; i < 5; i++) {
    const dateFrom = dayjs(getRandomDate(start, end)).toISOString();
    const dateTo = dayjs(dateFrom).add(Math.floor(Math.random() * 12) + 1, 'hour').toISOString();

    points.push({
      id: String(i + 1),
      type: getRandomElement(EVENT_TYPES),
      destinationId: getRandomElement(DESTINATIONS).id,
      dateFrom,
      dateTo,
      basePrice: Math.floor(Math.random() * 500) + 50,
      isFavorite: Math.random() > 0.7,
      offers: getRandomElements(OFFERS, 2).map(offer => offer.id)
    });
  }

  return {
    points,
    destinations: DESTINATIONS,
    offers: OFFERS
  };
}
