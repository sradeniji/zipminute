import React from 'react';

const SlotCard = ({ slot, onClick }) => {
  // Format price
  const formatPrice = (priceCents) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  // Format time
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Format distance
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  return (
    <div className="slot-card" onClick={onClick}>
      <div className="slot-card-header">
        <h3 className="slot-card-title">{slot.service?.name || 'Service'}</h3>
        <div className="slot-card-price">{formatPrice(slot.priceCents)}</div>
      </div>

      <div className="slot-card-body">
        <div className="slot-card-info">
          <p className="slot-card-time">{formatTime(slot.startAt)}</p>
          {slot.distanceKm && (
            <p className="slot-card-distance">
              {formatDistance(slot.distanceKm)} away
            </p>
          )}
        </div>

        {slot.vendor && (
          <div className="slot-card-vendor">
            <p className="vendor-name">{slot.vendor.name}</p>
            {slot.vendor.rating && (
              <p className="vendor-rating">★ {slot.vendor.rating}</p>
            )}
          </div>
        )}

        {slot.location && (
          <div className="slot-card-location">
            <p className="location-name">{slot.location.name}</p>
            <p className="location-address">{slot.location.address}</p>
          </div>
        )}

        {slot.service && (
          <div className="slot-card-service">
            <span className="service-category">{slot.service.category}</span>
            {slot.service.durationMinutes && (
              <span className="service-duration">
                {slot.service.durationMinutes} min
              </span>
            )}
          </div>
        )}
      </div>

      <div className="slot-card-footer">
        <button className="btn btn-primary btn-sm">
          View Details
        </button>
      </div>
    </div>
  );
};

export default SlotCard;
