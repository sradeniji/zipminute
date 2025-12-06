/**
 * API utility functions for making HTTP requests
 */

// Use environment variable in production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Search for available slots
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchSlots(params) {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/api/search?${queryString}`);
}

/**
 * Get slot details by ID
 * @param {string} slotId - Slot ID
 * @returns {Promise<Object>} Slot details
 */
export async function getSlot(slotId) {
  return apiRequest(`/api/slots/${slotId}`);
}

/**
 * Create a booking (hold slot)
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object>} Booking response
 */
export async function createBooking(bookingData) {
  return apiRequest('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

/**
 * Confirm a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Confirmation response
 */
export async function confirmBooking(bookingId) {
  return apiRequest(`/api/bookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'confirm' }),
  });
}

/**
 * Get vendor services
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array>} Vendor services
 */
export async function getVendorServices(vendorId) {
  return apiRequest('/api/vendors/me/services', {
    headers: {
      'x-vendor-id': vendorId,
    },
  });
}

/**
 * Create a new service
 * @param {Object} serviceData - Service data
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Created service
 */
export async function createService(serviceData, vendorId) {
  return apiRequest('/api/vendors/me/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
    headers: {
      'x-vendor-id': vendorId,
    },
  });
}

/**
 * Get vendor slots
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Array>} Vendor slots
 */
export async function getVendorSlots(vendorId) {
  return apiRequest('/api/vendors/me/slots', {
    headers: {
      'x-vendor-id': vendorId,
    },
  });
}

/**
 * Create a new slot
 * @param {Object} slotData - Slot data
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Created slot
 */
export async function createSlot(slotData, vendorId) {
  return apiRequest('/api/slots', {
    method: 'POST',
    body: JSON.stringify(slotData),
    headers: {
      'x-vendor-id': vendorId,
    },
  });
}

/**
 * Update a slot
 * @param {string} slotId - Slot ID
 * @param {Object} updates - Slot updates
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Updated slot
 */
export async function updateSlot(slotId, updates, vendorId) {
  return apiRequest(`/api/slots/${slotId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
    headers: {
      'x-vendor-id': vendorId,
    },
  });
}

/**
 * Delete a slot
 * @param {string} slotId - Slot ID
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteSlot(slotId, vendorId) {
  return apiRequest(`/api/slots/${slotId}`, {
    method: 'DELETE',
    headers: {
      'x-vendor-id': vendorId,
    },
  });
}

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
  return apiRequest('/api/health');
}
