/**
 * Vendor Slots utility functions
 */

/**
 * Validate slot input
 * @param {Object} input - Slot input
 * @param {string} input.serviceId - Service ID
 * @param {string} input.startAt - Start time ISO string
 * @param {string} input.endAt - End time ISO string
 * @param {number} input.priceCents - Price in cents
 * @returns {string[]} Array of validation errors
 */
export function validateSlot(input) {
  const errors = [];
  if (!input.serviceId) errors.push("Service is required");
  const start = Date.parse(input.startAt);
  const end = Date.parse(input.endAt);
  if (!Number.isFinite(start) || !Number.isFinite(end)) errors.push("Start/End must be valid times");
  if (end <= start) errors.push("End must be after Start");
  if (!Number.isFinite(input.priceCents) || input.priceCents < 0) errors.push("Price must be ≥ 0");
  return errors;
}

/**
 * Generate quick repeat slots
 * @param {Object} base - Base slot input
 * @param {number} count - Number of slots to generate
 * @param {number} gapMinutes - Gap between slots in minutes (default: 10)
 * @returns {Array} Array of slot inputs
 */
export function quickRepeat(base, count, gapMinutes = 10) {
  const slots = [];
  let start = Date.parse(base.startAt);
  let end = Date.parse(base.endAt);
  
  for (let i = 0; i < count; i++) {
    slots.push({
      serviceId: base.serviceId,
      startAt: new Date(start).toISOString(),
      endAt: new Date(end).toISOString(),
      priceCents: base.priceCents,
    });
    
    const durationMs = end - start;
    start = end + gapMinutes * 60 * 1000;
    end = start + durationMs;
  }
  
  return slots;
}

/**
 * Format slot time for display
 * @param {string} startAt - Start time ISO string
 * @param {string} endAt - End time ISO string
 * @returns {string} Formatted time range
 */
export function formatSlotTime(startAt, endAt) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  
  const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = start.toLocaleDateString();
  
  return `${date} ${startTime} - ${endTime}`;
}

/**
 * Get slot duration in minutes
 * @param {string} startAt - Start time ISO string
 * @param {string} endAt - End time ISO string
 * @returns {number} Duration in minutes
 */
export function getSlotDuration(startAt, endAt) {
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  return Math.round((end - start) / (1000 * 60));
}

/**
 * Check if slot is in the future
 * @param {string} startAt - Start time ISO string
 * @returns {boolean} True if slot is in the future
 */
export function isFutureSlot(startAt) {
  return Date.parse(startAt) > Date.now();
}

/**
 * Check if slot can be edited
 * @param {Object} slot - Slot object
 * @returns {boolean} True if slot can be edited
 */
export function canEditSlot(slot) {
  return slot.status === 'OPEN' && isFutureSlot(slot.startAt);
}
