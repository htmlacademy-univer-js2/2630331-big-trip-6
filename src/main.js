import Presenter from './presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import PointsModel from './model/points-model.js';
import ApiService, { adaptToClient } from './api.js';

// API Configuration
const API_BASE_URL = 'https://23.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = `Basic ${ Math.random().toString(36).substring(2, 15) }${Math.random().toString(36).substring(2, 15)}`;

// Show loading state
function showLoadingState() {
  const eventsSection = document.querySelector('.trip-events');
  eventsSection.innerHTML = '<p class="trip-events__msg">Loading...</p>';
}

// Show error state
function showErrorState(message = 'Failed to load data') {
  const eventsSection = document.querySelector('.trip-events');
  eventsSection.innerHTML = `<p class="trip-events__msg">${message}</p>`;
}

// Initialize application
async function initApp() {
  // Show loading placeholder FIRST
  showLoadingState();
  try {

    // Create API service
    const apiService = new ApiService(API_BASE_URL, AUTHORIZATION);

    // Load all data in parallel
    const [pointsData, destinationsData, offersData] = await Promise.all([
      apiService.getPoints(),
      apiService.getDestinations(),
      apiService.getOffers()
    ]);

    // Adapt server points to client format
    const adaptedPoints = pointsData.map(adaptToClient);

    // Create model with loaded data
    const model = new PointsModel(adaptedPoints, destinationsData, offersData);

    // Create main presenter and initialize with model and API
    const presenter = new Presenter(model, apiService);
    presenter.init();

    // Create trip info presenter and initialize
    const tripInfoPresenter = new TripInfoPresenter(
      document.querySelector('.trip-main'),
      model
    );
    tripInfoPresenter.init();
  } catch (error) {
    showErrorState('Failed to load latest route information.');
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
