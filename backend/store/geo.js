// Haversine formula to calculate distance between two points
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Check if a point is within a radius of another point
const isWithinRadius = (lat1, lng1, lat2, lng2, radiusKm) => {
  return distanceKm(lat1, lng1, lat2, lng2) <= radiusKm;
};

// Get bounding box for a point and radius (for approximate filtering)
const getBoundingBox = (lat, lng, radiusKm) => {
  const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(lat)));
  
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta
  };
};

export default {
  distanceKm,
  toRadians,
  isWithinRadius,
  getBoundingBox
};


