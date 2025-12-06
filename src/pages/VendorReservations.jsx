import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { getVendorServices, getVendorSlots } from '../utils/api';

const VendorReservations = () => {
  const { state } = useStore();
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, past

  const vendorId = state.vendor?.id || 'vnd_demo_1';

  useEffect(() => {
    loadReservationsData();
  }, []);

  const loadReservationsData = async () => {
    try {
      setLoading(true);
      
      const [servicesData, slotsData] = await Promise.all([
        getVendorServices(vendorId),
        getVendorSlots(vendorId)
      ]);

      setServices(servicesData);
      setSlots(slotsData);

      // Create bookings from slots with status BOOKED or HELD
      const allBookings = slotsData
        .filter(slot => slot.status === 'BOOKED' || slot.status === 'HELD')
        .map(slot => {
          const service = servicesData.find(s => s.id === slot.serviceId);
          return {
            id: slot.id,
            serviceId: slot.serviceId,
            serviceName: service?.name || 'Service',
            serviceCategory: service?.category || 'general',
            startAt: slot.startAt,
            endAt: slot.endAt,
            priceCents: slot.priceCents,
            status: slot.status,
            createdAt: slot.createdAt || slot.startAt
          };
        })
        .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError(error.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.startAt);
          return bookingDate >= today && bookingDate < tomorrow;
        });
      case 'upcoming':
        return bookings.filter(booking => new Date(booking.startAt) > now);
      case 'past':
        return bookings.filter(booking => new Date(booking.startAt) < now);
      default:
        return bookings;
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString();
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPrice = (priceCents) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED': return 'status-booked';
      case 'HELD': return 'status-held';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="vendor-reservations">
        <div className="container">
          <div className="loading">
            <p>Loading reservations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-reservations">
        <div className="container">
          <div className="error">
            <h2>Error Loading Reservations</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadReservationsData}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-reservations">
      <div className="container">
        <header className="reservations-header">
          <button 
            className="btn btn-secondary"
            onClick={() => window.navigate('/vendor/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <h1>Reservations</h1>
          <p>Manage your customer bookings and reservations</p>
        </header>

        <div className="reservations-content">
          <div className="reservations-filters">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({bookings.length})
              </button>
              <button 
                className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
              >
                Today ({getFilteredBookings().length})
              </button>
              <button 
                className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming ({getFilteredBookings().length})
              </button>
              <button 
                className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
                onClick={() => setFilter('past')}
              >
                Past ({getFilteredBookings().length})
              </button>
            </div>
          </div>

          <div className="reservations-list">
            {filteredBookings.length > 0 ? (
              <div className="bookings-grid">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3>{booking.serviceName}</h3>
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div className="booking-time">
                        <h4>Date & Time</h4>
                        <p>{formatDate(booking.startAt)}</p>
                        <p>{formatTime(booking.startAt)} - {formatTime(booking.endAt)}</p>
                      </div>

                      <div className="booking-price">
                        <h4>Price</h4>
                        <p className="price">{formatPrice(booking.priceCents)}</p>
                      </div>

                      <div className="booking-category">
                        <h4>Category</h4>
                        <span className="category-badge">
                          {booking.serviceCategory}
                        </span>
                      </div>
                    </div>

                    <div className="booking-actions">
                      {booking.status === 'HELD' && (
                        <button className="btn btn-warning btn-sm">
                          Hold Expires Soon
                        </button>
                      )}
                      {booking.status === 'BOOKED' && (
                        <button className="btn btn-success btn-sm">
                          Confirmed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reservations">
                <h3>No Reservations Found</h3>
                <p>
                  {filter === 'all' 
                    ? "You don't have any reservations yet."
                    : `No reservations found for ${filter} bookings.`
                  }
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.navigate('/vendor/slots')}
                >
                  Create Available Slots
                </button>
              </div>
            )}
          </div>

          <div className="reservations-summary">
            <div className="summary-stats">
              <div className="summary-card">
                <h4>Total Reservations</h4>
                <p className="stat-number">{bookings.length}</p>
              </div>
              <div className="summary-card">
                <h4>Confirmed</h4>
                <p className="stat-number">
                  {bookings.filter(b => b.status === 'BOOKED').length}
                </p>
              </div>
              <div className="summary-card">
                <h4>Pending</h4>
                <p className="stat-number">
                  {bookings.filter(b => b.status === 'HELD').length}
                </p>
              </div>
              <div className="summary-card">
                <h4>Total Revenue</h4>
                <p className="stat-number">
                  {formatPrice(bookings.reduce((sum, b) => sum + b.priceCents, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorReservations;
