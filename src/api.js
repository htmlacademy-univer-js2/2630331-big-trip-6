/**
 * ApiService - Handles all API requests to the server
 * Base URL: https://21.objects.pages.academy/big-trip
 * Requires Authorization header on all requests
 */
export default class ApiService {
  #baseUrl;
  #authorization;

  constructor(baseUrl, authorization) {
    this.#baseUrl = baseUrl;
    this.#authorization = authorization;
  }

  /**
   * Fetch wrapper with error handling
   * @private
   * @param {string} url - Relative URL path
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Parsed JSON response
   * @throws {Error} On non-ok response
   */
  async #fetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.#authorization,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all waypoints from server
   * @returns {Promise<Array>} Array of points in server format
   */
  async getPoints() {
    const url = `${this.#baseUrl}/points`;
    return this.#fetch(url);
  }

  /**
   * Update a single waypoint on server
   * @param {Object} point - Point object in app format
   * @returns {Promise<Object>} Updated point in server format
   */
  async updatePoint(point) {
    const url = `${this.#baseUrl}/points/${point.id}`;
    const serverPoint = adaptToServer(point);
    return this.#fetch(url, {
      method: 'PUT',
      body: JSON.stringify(serverPoint)
    });
  }

  /**
   * Get all destinations from server
   * @returns {Promise<Array>} Array of destination objects
   */
  async getDestinations() {
    const url = `${this.#baseUrl}/destinations`;
    return this.#fetch(url);
  }

  /**
   * Get all offers from server grouped by type
   * @returns {Promise<Array>} Array of offers with type
   */
  async getOffers() {
    const url = `${this.#baseUrl}/offers`;
    return this.#fetch(url);
  }
}

/**
 * Convert server point format (snake_case) to app format (camelCase)
 * @param {Object} serverPoint - Point in server format
 * @returns {Object} Point in app format
 */
export function adaptToClient(serverPoint) {
  return {
    id: serverPoint.id,
    type: serverPoint.type,
    destinationId: serverPoint.destination.id,
    basePrice: serverPoint.base_price,
    dateFrom: serverPoint.date_from,
    dateTo: serverPoint.date_to,
    isFavorite: serverPoint.is_favorite,
    offers: new Set(serverPoint.offers) // Convert array to Set
  };
}

/**
 * Convert app point format (camelCase) to server format (snake_case)
 * @param {Object} clientPoint - Point in app format
 * @returns {Object} Point in server format
 */
export function adaptToServer(clientPoint) {
  return {
    id: clientPoint.id,
    type: clientPoint.type,
    destination: {
      id: clientPoint.destinationId,
      name: clientPoint.destinationName || '',
      description: clientPoint.destinationDescription || '',
      pictures: clientPoint.destinationPictures || []
    },
    base_price: clientPoint.basePrice,
    date_from: clientPoint.dateFrom,
    date_to: clientPoint.dateTo,
    is_favorite: clientPoint.isFavorite,
    offers: Array.from(clientPoint.offers || []) // Convert Set back to array
  };
}
