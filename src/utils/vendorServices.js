/**
 * Vendor Services utility functions
 */

/**
 * Validate service input
 * @param {Object} input - Service input
 * @param {string} input.title - Service title
 * @param {number} input.durationMin - Duration in minutes
 * @param {number} input.basePriceCents - Base price in cents
 * @param {string} input.category - Service category
 * @returns {string[]} Array of validation errors
 */
export function validateService(input) {
  const errors = [];
  if (!input.title?.trim()) errors.push("Title is required");
  if (!Number.isFinite(input.durationMin) || input.durationMin <= 0) errors.push("Duration must be > 0");
  if (!Number.isFinite(input.basePriceCents) || input.basePriceCents < 0) errors.push("Price must be ≥ 0");
  if (!input.category?.trim()) errors.push("Category is required");
  return errors;
}

/**
 * Normalize service input data
 * @param {Object} input - Service input
 * @returns {Object} Normalized service input
 */
export function normalizeService(input) {
  return {
    ...input,
    title: input.title.trim(),
    category: input.category.trim().toLowerCase(),
  };
}

/**
 * Format service duration for display
 * @param {number} durationMin - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatDuration(durationMin) {
  if (durationMin < 60) {
    return `${durationMin} min`;
  }
  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Format service price for display
 * @param {number} priceCents - Price in cents
 * @returns {string} Formatted price string
 */
export function formatServicePrice(priceCents) {
  return `$${(priceCents / 100).toFixed(2)}`;
}
