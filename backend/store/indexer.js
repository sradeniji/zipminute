// Build in-memory indexes for fast lookups
const rebuild = (state) => {
  const indexes = {
    byServiceId: {},
    byVendorId: {},
    locationsByVendorId: {},
    slotsByStatus: {
      OPEN: [],
      HELD: [],
      BOOKED: []
    },
    servicesByCategory: {},
    bookingsBySlotId: {},
    bookingsByStatus: {
      PENDING: [],
      CONFIRMED: [],
      CANCELLED: []
    }
  };

  // Index services by ID
  if (state.services) {
    state.services.forEach(service => {
      indexes.byServiceId[service.id] = service;
      
      // Index by category
      if (service.category) {
        if (!indexes.servicesByCategory[service.category]) {
          indexes.servicesByCategory[service.category] = [];
        }
        indexes.servicesByCategory[service.category].push(service);
      }
    });
  }

  // Index vendors by ID
  if (state.vendors) {
    state.vendors.forEach(vendor => {
      indexes.byVendorId[vendor.id] = vendor;
    });
  }

  // Index locations by vendor ID
  if (state.locations) {
    state.locations.forEach(location => {
      if (location.vendorId) {
        if (!indexes.locationsByVendorId[location.vendorId]) {
          indexes.locationsByVendorId[location.vendorId] = [];
        }
        indexes.locationsByVendorId[location.vendorId].push(location);
      }
    });
  }

  // Index slots by status
  if (state.slots) {
    state.slots.forEach(slot => {
      if (slot.status && indexes.slotsByStatus[slot.status]) {
        indexes.slotsByStatus[slot.status].push(slot);
      }
    });
  }

  // Index bookings by slot ID and status
  if (state.bookings) {
    state.bookings.forEach(booking => {
      if (booking.slotId) {
        if (!indexes.bookingsBySlotId[booking.slotId]) {
          indexes.bookingsBySlotId[booking.slotId] = [];
        }
        indexes.bookingsBySlotId[booking.slotId].push(booking);
      }
      
      if (booking.status && indexes.bookingsByStatus[booking.status]) {
        indexes.bookingsByStatus[booking.status].push(booking);
      }
    });
  }

  return indexes;
};

// Helper to get slots by status
const getSlotsByStatus = (indexes, status) => {
  return indexes.slotsByStatus[status] || [];
};

// Helper to get services by category
const getServicesByCategory = (indexes, category) => {
  return indexes.servicesByCategory[category] || [];
};

// Helper to get locations by vendor
const getLocationsByVendor = (indexes, vendorId) => {
  return indexes.locationsByVendorId[vendorId] || [];
};

// Helper to get bookings by slot
const getBookingsBySlot = (indexes, slotId) => {
  return indexes.bookingsBySlotId[slotId] || [];
};

// Helper to get bookings by status
const getBookingsByStatus = (indexes, status) => {
  return indexes.bookingsByStatus[status] || [];
};

// Helper to get service by ID
const getServiceById = (indexes, serviceId) => {
  return indexes.byServiceId[serviceId];
};

// Helper to get vendor by ID
const getVendorById = (indexes, vendorId) => {
  return indexes.byVendorId[vendorId];
};

export default {
  rebuild,
  getSlotsByStatus,
  getServicesByCategory,
  getLocationsByVendor,
  getBookingsBySlot,
  getBookingsByStatus,
  getServiceById,
  getVendorById
};


