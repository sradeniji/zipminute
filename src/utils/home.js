/**
 * Home page utility functions
 */

/**
 * Build search parameters from home form input
 * @param {Object} input - Home search input
 * @param {string} input.category - Service category
 * @param {number} input.withinHours - Hours to search within
 * @param {number} input.lat - Latitude
 * @param {number} input.lng - Longitude
 * @param {number} input.radiusKm - Search radius in km
 * @returns {URLSearchParams} Search parameters
 */
export function buildSearchParams(input) {
  const p = new URLSearchParams();
  if (input.category) p.set("category", input.category);
  p.set("withinHours", String(input.withinHours ?? 2));
  if (input.lat != null && input.lng != null) {
    p.set("lat", String(input.lat));
    p.set("lng", String(input.lng));
  }
  p.set("radiusKm", String(input.radiusKm ?? 10));
  p.set("limit", "20");
  p.set("offset", "0");
  return p;
}

/**
 * Remember user's last search choices in localStorage
 * @param {Object} input - Home search input
 */
export function rememberLastChoices(input) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("home:last", JSON.stringify(input));
}

/**
 * Read user's last search choices from localStorage
 * @returns {Object|null} Last search choices or null
 */
export function readLastChoices() {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem("home:last");
  if (!raw) return null;
  try { 
    return JSON.parse(raw); 
  } catch { 
    return null; 
  }
}
