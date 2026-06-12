/**
 * PointsModel - Centralized data management for trip points
 * Handles CRUD operations and observer pattern for data synchronization
 */

export default class PointsModel {
  #points = [];
  #destinations = [];
  #offers = [];
  #observers = [];
  #nextId = 1;

  constructor(points = [], destinations = [], offers = []) {
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;

    // Calculate next ID based on existing points
    if (points.length > 0) {
      const maxId = Math.max(...points.map((p) => p.id || 0));
      this.#nextId = maxId + 1;
    }
  }

  /**
   * Get immutable copy of all points
   * @returns {Array} Deep copy of points array
   */
  getPoints() {
    return JSON.parse(JSON.stringify(this.#points));
  }

  /**
   * Get immutable copy of all destinations
   * @returns {Array} Array of destination objects
   */
  getDestinations() {
    return JSON.parse(JSON.stringify(this.#destinations));
  }

  /**
   * Get immutable copy of all offers
   * @returns {Array} Array of offer objects
   */
  getOffers() {
    return JSON.parse(JSON.stringify(this.#offers));
  }

  /**
   * Replace entire points array with new data
   * @param {Array} points - New points array
   * @throws {Error} If points is not an array
   */
  setPoints(points) {
    if (!Array.isArray(points)) {
      throw new Error('Points must be an array');
    }
    this.#points = JSON.parse(JSON.stringify(points));
    this.#notifyObservers();
  }

  /**
   * Update single point by ID
   * @param {Object} updatedPoint - Point with updated data (must have id)
   * @returns {Object|null} Updated point or null if not found
   * @throws {Error} If updatedPoint has no id
   */
  updatePoint(updatedPoint) {
    if (!updatedPoint || !updatedPoint.id) {
      throw new Error('Point must have an id');
    }

    const index = this.#points.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      return null;
    }

    // Merge updates with existing point (preserve fields not provided)
    this.#points[index] = {
      ...this.#points[index],
      ...updatedPoint,
      id: updatedPoint.id // Ensure ID doesn't change
    };

    this.#notifyObservers();
    return JSON.parse(JSON.stringify(this.#points[index]));
  }

  /**
   * Add new point to the collection
   * @param {Object} point - Point data (id will be auto-generated if not provided)
   * @returns {Object} Created point with assigned ID
   * @throws {Error} If point is null/undefined
   */
  addPoint(point) {
    if (!point) {
      throw new Error('Point must be provided');
    }

    const newPoint = {
      ...point,
      id: point.id || this.#nextId++
    };

    this.#points.push(JSON.parse(JSON.stringify(newPoint)));
    this.#notifyObservers();
    return JSON.parse(JSON.stringify(newPoint));
  }

  /**
   * Delete point by ID
   * @param {number|string} pointId - ID of point to delete
   * @returns {boolean} True if deleted, false if not found
   */
  deletePoint(pointId) {
    const index = this.#points.findIndex((p) => p.id === pointId);
    if (index === -1) {
      return false;
    }

    this.#points.splice(index, 1);
    this.#notifyObservers();
    return true;
  }

  /**
   * Get single point by ID
   * @param {number|string} pointId - ID of point to retrieve
   * @returns {Object|null} Point or null if not found
   */
  getPointById(pointId) {
    const point = this.#points.find((p) => p.id === pointId);
    return point ? JSON.parse(JSON.stringify(point)) : null;
  }

  /**
   * Get offers for specific transport type
   * @param {string} type - Transport type (e.g., 'flight', 'taxi')
   * @returns {Array} Offers for this type
   */
  getOffersByType(type) {
    return this.#offers
      .filter((offer) => offer.type === type)
      .map((offer) => JSON.parse(JSON.stringify(offer)));
  }

  /**
   * Get specific offers by their IDs
   * @param {Array} offerIds - Array of offer IDs
   * @returns {Array} Offer objects
   */
  getOffersByIds(offerIds) {
    if (!Array.isArray(offerIds)) {
      return [];
    }
    return this.#offers
      .filter((offer) => offerIds.includes(offer.id))
      .map((offer) => JSON.parse(JSON.stringify(offer)));
  }

  /**
   * Get destination by ID
   * @param {number|string} destinationId - ID of destination
   * @returns {Object|null} Destination or null if not found
   */
  getDestinationById(destinationId) {
    const destination = this.#destinations.find((d) => d.id === destinationId);
    return destination ? JSON.parse(JSON.stringify(destination)) : null;
  }

  /**
   * Get all offers for a point
   * @param {Object} point - Point object
   * @returns {Array} Array of offer objects
   */
  getPointOffers(point) {
    if (!point || !Array.isArray(point.offers)) {
      return [];
    }
    return this.getOffersByIds(point.offers);
  }

  /**
   * Register observer for data changes
   * @param {Function} callback - Called when data changes
   */
  addObserver(callback) {
    this.subscribe(callback);
  }

  /**
   * Register observer for data changes
   * @param {Function} callback - Called when data changes
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.#observers.push(callback);
    }
  }

  /**
   * Unregister observer
   * @param {Function} callback - Callback to remove
   */
  unsubscribe(callback) {
    this.#observers = this.#observers.filter((obs) => obs !== callback);
  }

  /**
   * Update point with server sync
   * Calls API to update on server, then updates local state
   * @param {Object} updatedPoint - Point with updated data
   * @param {ApiService} apiService - API service instance
   * @returns {Promise<Object>} Updated point or rejects on error
   * @throws {Error} If server update fails
   */
  async updateWaypoint(updatedPoint, apiService) {
    if (!updatedPoint || !updatedPoint.id) {
      throw new Error('Point must have an id');
    }

    if (!apiService) {
      throw new Error('API service is required for server sync');
    }

    try {
      // Import adapter inside the method to avoid circular dependencies
      const { adaptToClient } = await import('../api.js');

      // First, call API to update on server
      const serverResponse = await apiService.updatePoint(updatedPoint);

      // Convert server response to client format
      const adaptedPoint = adaptToClient(serverResponse);

      // Now update local data with server response
      const index = this.#points.findIndex((p) => p.id === adaptedPoint.id);
      if (index === -1) {
        throw new Error(`Point with id ${adaptedPoint.id} not found in local data`);
      }

      this.#points[index] = {
        ...this.#points[index],
        ...adaptedPoint,
        id: adaptedPoint.id
      };

      // Notify observers of successful update
      this.#notifyObservers();

      return JSON.parse(JSON.stringify(this.#points[index]));
    } catch (error) {
      // Do NOT update local data if server update fails
      throw error;
    }
  }

  /**
   * Add a new point with server sync
   * Calls API to create on server, then inserts into local array
   * @param {Object} newPoint - Point data without id
   * @param {ApiService} apiService - API service instance
   * @returns {Promise<Object>} Created point with server-assigned id
   * @throws {Error} If server creation fails
   */
  async addWaypoint(newPoint, apiService) {
    if (!newPoint) {
      throw new Error('Point must be provided');
    }

    if (!apiService) {
      throw new Error('API service is required for server sync');
    }

    try {
      // Call API to create point on server
      const createdPoint = await apiService.addPoint(newPoint);

      // Insert into local array sorted by date
      this.#points.push(createdPoint);
      this.#sortPointsByDate();

      // Notify observers of successful creation
      this.#notifyObservers();

      return JSON.parse(JSON.stringify(createdPoint));
    } catch (error) {
      // Do NOT update local data if server creation fails
      throw error;
      // Error will be handled by caller
    }
  }

  /**
   * Delete a point with server sync
   * Calls API to delete on server, then removes from local array
   * @param {number|string} pointId - ID of point to delete
   * @param {ApiService} apiService - API service instance
   * @returns {Promise<void>} Resolves on success
   * @throws {Error} If server deletion fails
   */
  async deleteWaypoint(pointId, apiService) {
    if (!pointId) {
      throw new Error('Point ID must be provided');
    }

    if (!apiService) {
      throw new Error('API service is required for server sync');
    }

    try {
      // Call API to delete point from server
      await apiService.deletePoint(pointId);

      // Remove from local array
      const index = this.#points.findIndex((p) => p.id === pointId);
      if (index === -1) {
        throw new Error(`Point with id ${pointId} not found in local data`);
      }

      this.#points.splice(index, 1);

      // Notify observers of successful deletion
      this.#notifyObservers();
      // Error will be handled by caller
    } catch (error) {
      // Do NOT update local data if server deletion fails
      throw error;
    }
  }

  /**
   * Sort points array by date (dateFrom)
   * @private
   */
  #sortPointsByDate() {
    this.#points.sort((a, b) => {
      const dateA = new Date(a.dateFrom).getTime();
      const dateB = new Date(b.dateFrom).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Notify all observers of data changes
   * @private
   */
  #notifyObservers() {
    this.#observers.forEach((callback) => {
      try {
        callback();
        // Silently ignore callback errors
      } catch (error) {
      }
    });
  }

  /**
   * Reset all data and observers
   * Useful for testing or complete refresh
   */
  reset() {
    this.#points = [];
    this.#observers = [];
    this.#nextId = 1;
  }

  /**
   * Get total number of points
   * @returns {number} Count of points
   */
  getPointsCount() {
    return this.#points.length;
  }
}
