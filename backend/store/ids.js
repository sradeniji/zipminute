// Generate unique IDs with prefixes
const id = (prefix = '') => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 10000).toString(36);
  return `${prefix}${now.toString(36)}${random}`;
};

// Generate slot ID
const slotId = () => id('slt_');

// Generate booking ID
const bookingId = () => id('bkg_');

// Generate service ID
const serviceId = () => id('srv_');

// Generate vendor ID
const vendorId = () => id('vnd_');

// Generate location ID
const locationId = () => id('loc_');

// Generate user ID
const userId = () => id('usr_');

// Generate review ID
const reviewId = () => id('rev_');

export default {
  id,
  slotId,
  bookingId,
  serviceId,
  vendorId,
  locationId,
  userId,
  reviewId
};


