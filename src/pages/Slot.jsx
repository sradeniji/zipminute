import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { getSlot, createBooking, confirmBooking } from '../utils/api';

const Slot = ({ slotId }) => {
  const { actions } = useStore();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [countdown, setCountdown] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, holding, confirmed, expired

  // Load slot details
  useEffect(() => {
    if (slotId) {
      loadSlotDetails();
    }
  }, [slotId]);

  // Countdown timer for booking hold
  useEffect(() => {
    if (booking && booking.holdExpiresAt && bookingStatus === 'holding') {
      const timer = setInterval(() => {
        const now = new Date();
        const expiry = new Date(booking.holdExpiresAt);
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setCountdown(remaining);
        
        if (remaining === 0) {
          setBookingStatus('expired');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [booking, bookingStatus]);

  const loadSlotDetails = async () => {
    try {
      setLoading(true);
      const data = await getSlot(slotId);
      setSlot(data);
    } catch (error) {
      console.error('Error loading slot:', error);
      setError(error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.customerName || !bookingForm.customerEmail) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const data = await createBooking({
        slotId,
        ...bookingForm
      });

      setBooking(data);
      setBookingStatus('holding');
      actions.addNotification('Slot held! You have 10 minutes to confirm.', 'success');
    } catch (error) {
      console.error('Booking error:', error);
      actions.addNotification(error.message || 'Network error', 'error');
    }
  };

  const handleConfirmBooking = async () => {
    try {
      await confirmBooking(booking.id);
      setBookingStatus('confirmed');
      actions.addNotification('Booking confirmed!', 'success');
    } catch (error) {
      console.error('Confirmation error:', error);
      actions.addNotification(error.message || 'Network error', 'error');
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const formatPrice = (priceCents) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="slot-page">
        <div className="container">
          <div className="loading">
            <p>Loading slot details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !slot) {
    return (
      <div className="slot-page">
        <div className="container">
          <div className="error">
            <h2>Slot Not Found</h2>
            <p>{error || 'This slot is no longer available.'}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.navigate('/')}
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slot-page">
      <div className="container">
        <header className="slot-header">
          <button 
            className="btn btn-secondary"
            onClick={() => window.history.back()}
          >
            ← Back
          </button>
          <h1>{slot.service?.name || 'Service'}</h1>
        </header>

        <div className="slot-details">
          <div className="slot-info">
            <div className="slot-time">
              <h3>When</h3>
              <p>{formatTime(slot.startAt)} - {formatTime(slot.endAt)}</p>
            </div>

            <div className="slot-price">
              <h3>Price</h3>
              <p className="price">{formatPrice(slot.priceCents)}</p>
            </div>

            {slot.vendor && (
              <div className="slot-vendor">
                <h3>Provider</h3>
                <p className="vendor-name">{slot.vendor.name}</p>
                {slot.vendor.rating && (
                  <p className="vendor-rating">★ {slot.vendor.rating}</p>
                )}
                {slot.vendor.phone && (
                  <p className="vendor-phone">📞 {slot.vendor.phone}</p>
                )}
              </div>
            )}

            {slot.location && (
              <div className="slot-location">
                <h3>Location</h3>
                <p className="location-name">{slot.location.name}</p>
                <p className="location-address">{slot.location.address}</p>
              </div>
            )}

            {slot.service && (
              <div className="slot-service">
                <h3>Service Details</h3>
                <p className="service-category">Category: {slot.service.category}</p>
                <p className="service-duration">Duration: {slot.service.durationMinutes} minutes</p>
                {slot.service.description && (
                  <p className="service-description">{slot.service.description}</p>
                )}
              </div>
            )}
          </div>

          <div className="booking-section">
            {bookingStatus === 'idle' && (
              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <h3>Book This Slot</h3>
                <p className="booking-note">
                  This will hold the slot for 10 minutes while you complete your booking.
                </p>

                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg"
                  disabled={slot.status !== 'OPEN'}
                >
                  {slot.status === 'OPEN' ? 'Hold This Slot' : 'Slot Not Available'}
                </button>
              </form>
            )}

            {bookingStatus === 'holding' && (
              <div className="booking-hold">
                <h3>Slot Held!</h3>
                <p className="hold-message">
                  Your slot is reserved for the next {formatCountdown(countdown)}.
                </p>
                <p className="hold-note">
                  Complete your booking by clicking confirm below.
                </p>
                
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleConfirmBooking}
                >
                  Confirm Booking
                </button>
              </div>
            )}

            {bookingStatus === 'confirmed' && (
              <div className="booking-confirmed">
                <h3>✅ Booking Confirmed!</h3>
                <div className="confirmation-details">
                  <p><strong>Service:</strong> {slot.service?.name}</p>
                  <p><strong>Time:</strong> {formatTime(slot.startAt)}</p>
                  <p><strong>Provider:</strong> {slot.vendor?.name}</p>
                  <p><strong>Location:</strong> {slot.location?.name}</p>
                  <p><strong>Price:</strong> {formatPrice(slot.priceCents)}</p>
                </div>
                <p className="confirmation-note">
                  You will receive a confirmation email shortly.
                </p>
              </div>
            )}

            {bookingStatus === 'expired' && (
              <div className="booking-expired">
                <h3>⏰ Hold Expired</h3>
                <p>The hold on this slot has expired. The slot is now available for others to book.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setBookingStatus('idle');
                    setBooking(null);
                    setCountdown(null);
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slot;
