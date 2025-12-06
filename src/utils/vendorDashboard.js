/**
 * Vendor Dashboard utility functions
 */

/**
 * Calculate utilization percentage for slots
 * @param {Array} slots - Array of slot objects
 * @returns {number} Utilization percentage (0-100)
 */
export function utilization(slots) {
  const future = slots.filter(s => Date.parse(s.startAt) >= Date.now());
  if (future.length === 0) return 0;
  const booked = future.filter(s => s.status === "BOOKED").length;
  return Math.round((booked / future.length) * 100);
}

/**
 * Get upcoming slots within specified hours
 * @param {Array} slots - Array of slot objects
 * @param {number} withinHours - Hours to look ahead (default: 24)
 * @returns {Array} Array of upcoming slots sorted by start time
 */
export function upcoming(slots, withinHours = 24) {
  const now = Date.now();
  const to = now + withinHours * 3600 * 1000;
  return slots
    .filter(s => {
      const t = Date.parse(s.startAt);
      return t >= now && t <= to;
    })
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}

/**
 * Format utilization percentage for display
 * @param {number} percentage - Utilization percentage
 * @returns {string} Formatted percentage string
 */
export function formatUtilization(percentage) {
  return `${percentage}%`;
}

/**
 * Get slots by status
 * @param {Array} slots - Array of slot objects
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered slots
 */
export function getSlotsByStatus(slots, status) {
  return slots.filter(slot => slot.status === status);
}
