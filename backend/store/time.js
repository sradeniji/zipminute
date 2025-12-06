// Get current time in ISO format
const nowIso = () => {
  return new Date().toISOString();
};

// Add minutes to an ISO date string
const addMinutes = (isoString, minutes) => {
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

// Add hours to an ISO date string
const addHours = (isoString, hours) => {
  const date = new Date(isoString);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

// Check if a slot is within a time window
const withinWindow = (slot, fromIso, toIso) => {
  const slotStart = new Date(slot.startAt);
  const slotEnd = new Date(slot.endAt);
  const windowStart = new Date(fromIso);
  const windowEnd = new Date(toIso);
  
  // Slot overlaps with window if:
  // - slot starts before window ends AND
  // - slot ends after window starts
  return slotStart < windowEnd && slotEnd > windowStart;
};

// Check if a slot is in the future
const isFuture = (slot) => {
  const now = new Date();
  const slotStart = new Date(slot.startAt);
  return slotStart > now;
};

// Check if a slot is in the past
const isPast = (slot) => {
  const now = new Date();
  const slotEnd = new Date(slot.endAt);
  return slotEnd < now;
};

// Get time window for "within hours" search
const getTimeWindow = (withinHours) => {
  const now = new Date();
  const end = new Date(now.getTime() + (withinHours * 60 * 60 * 1000));
  return {
    from: now.toISOString(),
    to: end.toISOString()
  };
};

// Format time for display
const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

// Format date for display
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString();
};

// Check if a booking hold has expired
const isHoldExpired = (holdExpiresAt) => {
  const now = new Date();
  const expiry = new Date(holdExpiresAt);
  return now > expiry;
};

// Get hold expiry time (10 minutes from now)
const getHoldExpiry = () => {
  return addMinutes(nowIso(), 10);
};

export default {
  nowIso,
  addMinutes,
  addHours,
  withinWindow,
  isFuture,
  isPast,
  getTimeWindow,
  formatTime,
  formatDate,
  isHoldExpired,
  getHoldExpiry
};


