/**
 * Filter types enum
 */
export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

/**
 * Calculate which filters have available waypoints
 * Returns an object where key is filter type and value is whether filter is available
 * @param {Array} waypoints - Array of waypoint objects
 * @param {Date} now - Current date (default: now)
 * @returns {Object} Object with filter availability: { everything: true, future: false, ... }
 */
export function getFilterStats(waypoints, now = new Date()) {
  const hasWaypoints = waypoints.length > 0;
  
  return {
    [FilterType.EVERYTHING]: hasWaypoints,
    [FilterType.FUTURE]: waypoints.some(p => new Date(p.dateFrom) > now),
    [FilterType.PRESENT]: waypoints.some(p => {
      const dateFrom = new Date(p.dateFrom);
      const dateTo = new Date(p.dateTo);
      return dateFrom <= now && dateTo >= now;
    }),
    [FilterType.PAST]: waypoints.some(p => new Date(p.dateTo) < now)
  };
}

/**
 * Convert availability stats to disabled flags
 * (disabled = NOT available)
 * @param {Object} stats - Object from getFilterStats
 * @returns {Object} Object with disabled flags: { everything: false, future: true, ... }
 */
export function getDisabledFilters(stats) {
  const disabled = {};
  Object.keys(stats).forEach(key => {
    disabled[key] = !stats[key];
  });
  return disabled;
}
