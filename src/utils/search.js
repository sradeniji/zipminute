/**
 * Search page utility functions
 */

/**
 * Convert search parameters to query string
 * @param {Object} params - Search parameters
 * @param {number} params.lat - Latitude
 * @param {number} params.lng - Longitude
 * @param {number} params.radiusKm - Search radius in km
 * @param {number} params.withinHours - Hours to search within
 * @param {string} params.category - Service category
 * @param {number} params.limit - Results limit
 * @param {number} params.offset - Results offset
 * @returns {string} Query string
 */
export function toQueryString(params) {
  const q = new URLSearchParams();
  if (params.lat != null) q.set("lat", String(params.lat));
  if (params.lng != null) q.set("lng", String(params.lng));
  if (params.radiusKm != null) q.set("radiusKm", String(params.radiusKm));
  if (params.withinHours != null) q.set("withinHours", String(params.withinHours));
  if (params.category) q.set("category", params.category);
  q.set("limit", String(params.limit ?? 20));
  q.set("offset", String(params.offset ?? 0));
  return q.toString();
}

/**
 * Summarize a search result item for display
 * @param {Object} item - Slot item from search results
 * @param {string} item.slotId - Slot ID
 * @param {Object} item.service - Service details
 * @param {Object} item.vendor - Vendor details
 * @param {string} item.startAt - Start time
 * @param {number} item.priceCents - Price in cents
 * @param {Object} item.location - Location details
 * @returns {Object} Summary object
 */
export function summarizeResult(item) {
  return {
    id: item.slotId,
    title: `${item.service?.name || 'Service'} @ ${item.vendor?.name || 'Vendor'}`,
    time: new Date(item.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    price: (item.priceCents / 100).toFixed(2),
    distance: item.location?.distanceKm ? `${item.location.distanceKm.toFixed(1)} km` : null,
  };
}

/**
 * Calculate pagination info
 * @param {number} total - Total number of results
 * @param {number} limit - Results per page
 * @param {number} offset - Current offset
 * @returns {Object} Pagination info
 */
export function paginate(total, limit, offset) {
  const nextOffset = offset + limit;
  const hasMore = nextOffset < total;
  return { hasMore, nextOffset };
}
