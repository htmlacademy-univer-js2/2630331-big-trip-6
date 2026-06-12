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
   * Create a new waypoint on server
   * @param {Object} point - Point object in app format (without id)
   * @returns {Promise<Object>} Created point in client format with server-assigned id
   */
  async addPoint(point) {
    const url = `${this.#baseUrl}/points`;
    const serverPoint = adaptToServer(point);
    const serverResponse = await this.#fetch(url, {
      method: 'POST',
      body: JSON.stringify(serverPoint)
    });
    return adaptToClient(serverResponse);
  }

  /**
   * Delete a waypoint from server
   * @param {number|string} pointId - ID of point to delete
   * @returns {Promise<void>} Resolves on success
   */
  async deletePoint(pointId) {
    const url = `${this.#baseUrl}/points/${pointId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.#authorization
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete: ${response.status} ${response.statusText}`);
    }
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
    destinationId: serverPoint.destination,
    basePrice: serverPoint['base_price'],
    dateFrom: serverPoint['date_from'],
    dateTo: serverPoint['date_to'],
    isFavorite: serverPoint['is_favorite'],
    offers: serverPoint.offers || []
  };
}

/**
 * Convert app point format (camelCase) to server format (snake_case)
 * @param {Object} clientPoint - Point in app format
 * @returns {Object} Point in server format
 */
export function adaptToServer(clientPoint) {
  const result = {
    type: clientPoint.type,
    destination: clientPoint.destinationId || '',
    base_price: parseInt(clientPoint.basePrice, 10) || 0,
    date_from: clientPoint.dateFrom,
    date_to: clientPoint.dateTo,
    is_favorite: Boolean(clientPoint.isFavorite),
    offers: Array.from(clientPoint.offers || [])
  };
  if (clientPoint.id) {
    result.id = clientPoint.id;
  }
  return result;
}
