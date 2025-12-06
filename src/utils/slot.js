/**
 * Slot page utility functions
 */

/**
 * Validate booking input
 * @param {Object} booking - Booking input
 * @param {string} booking.slotId - Slot ID
 * @param {string} booking.customerName - Customer name
 * @param {string} booking.customerEmail - Customer email
 * @param {string} booking.customerPhone - Customer phone (optional)
 * @returns {string[]} Array of validation errors
 */
export function validateBookingInput(booking) {
  const errors = [];
  if (!booking.slotId) errors.push("Missing slotId");
  if (!booking.customerName) errors.push("Please enter your name");
  if (!/^\S+@\S+\.\S+$/.test(booking.customerEmail)) errors.push("Please enter a valid email");
  if (booking.customerPhone && booking.customerPhone.length < 7) errors.push("Please enter a valid phone");
  return errors;
}

/**
 * Calculate countdown seconds until hold expires
 * @param {string} endIso - ISO string of expiry time
 * @returns {number} Seconds remaining
 */
export function holdCountdown(endIso) {
  const now = Date.now();
  const end = Date.parse(endIso);
  return Math.max(0, Math.floor((end - now) / 1000));
}

/**
 * Format price in cents to dollar string
 * @param {number} cents - Price in cents
 * @returns {string} Formatted price string
 */
export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format time for display
 * @param {string} isoString - ISO time string
 * @returns {string} Formatted time
 */
export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

/**
 * Format countdown time
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted countdown (MM:SS)
 */
export function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
