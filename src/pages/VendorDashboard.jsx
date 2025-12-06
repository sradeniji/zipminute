import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { getVendorServices, getVendorSlots } from '../utils/api';
import { utilization, upcoming } from '../utils/vendorDashboard';

const VendorDashboard = () => {
  const { state } = useStore();
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get vendor ID (in real app, this would come from authentication)
  const vendorId = state.vendor?.id || 'vnd_demo_1';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load services and slots
      const [servicesData, slotsData] = await Promise.all([
        getVendorServices(vendorId),
        getVendorSlots(vendorId)
      ]);

      setServices(servicesData);
      setSlots(slotsData);

      // Calculate bookings from slots
      const allBookings = slotsData
        .filter(slot => slot.status === 'BOOKED' || slot.status === 'HELD')
        .map(slot => ({
          slotId: slot.id,
          serviceName: servicesData.find(s => s.id === slot.serviceId)?.name || 'Service',
          startAt: slot.startAt,
          endAt: slot.endAt,
          priceCents: slot.priceCents,
          status: slot.status
        }));

      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const utilizationRate = utilization(slots);
  const upcomingSlots = upcoming(slots, 24);
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startAt);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  });

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPrice = (priceCents) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="container">
          <div className="loading">
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-dashboard">
        <div className="container">
          <div className="error">
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadDashboardData}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="container">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Vendor Dashboard</h1>
            <p>Welcome back, {state.vendor?.name || 'Vendor'}!</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => window.navigate('/vendor/services')}
            >
              Manage Services
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => window.navigate('/vendor/slots')}
            >
              Add Slots
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Utilization Rate</h3>
              <p className="stat-value">{utilizationRate}%</p>
              <p className="stat-label">of future slots booked</p>
            </div>
            
            <div className="stat-card">
              <h3>Total Services</h3>
              <p className="stat-value">{services.length}</p>
              <p className="stat-label">active services</p>
            </div>

            <div className="stat-card">
              <h3>Today's Bookings</h3>
              <p className="stat-value">{todayBookings.length}</p>
              <p className="stat-label">confirmed bookings</p>
            </div>

            <div className="stat-card">
              <h3>Upcoming Slots</h3>
              <p className="stat-value">{upcomingSlots.length}</p>
              <p className="stat-label">slots in next 24h</p>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="section">
              <h3>Today's Bookings</h3>
              {todayBookings.length > 0 ? (
                <div className="bookings-list">
                  {todayBookings.map((booking, index) => (
                    <div key={index} className="booking-item">
                      <div className="booking-info">
                        <h4>{booking.serviceName}</h4>
                        <p className="booking-time">
                          {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                        </p>
                      </div>
                      <div className="booking-details">
                        <span className="booking-price">{formatPrice(booking.priceCents)}</span>
                        <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No bookings for today</p>
              )}
            </div>

            <div className="section">
              <h3>Upcoming Slots (Next 24h)</h3>
              {upcomingSlots.length > 0 ? (
                <div className="slots-list">
                  {upcomingSlots.slice(0, 5).map((slot, index) => (
                    <div key={index} className="slot-item">
                      <div className="slot-info">
                        <h4>{services.find(s => s.id === slot.serviceId)?.name || 'Service'}</h4>
                        <p className="slot-time">
                          {formatTime(slot.startAt)} - {formatTime(slot.endAt)}
                        </p>
                      </div>
                      <div className="slot-details">
                        <span className="slot-price">{formatPrice(slot.priceCents)}</span>
                        <span className={`slot-status status-${slot.status.toLowerCase()}`}>
                          {slot.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {upcomingSlots.length > 5 && (
                    <p className="more-items">+{upcomingSlots.length - 5} more slots</p>
                  )}
                </div>
              ) : (
                <p className="no-data">No upcoming slots</p>
              )}
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button 
                className="action-card"
                onClick={() => window.navigate('/vendor/services')}
              >
                <h4>Manage Services</h4>
                <p>Add, edit, or remove your services</p>
              </button>
              
              <button 
                className="action-card"
                onClick={() => window.navigate('/vendor/slots')}
              >
                <h4>Manage Slots</h4>
                <p>Create and manage your available time slots</p>
              </button>
              
              <button 
                className="action-card"
                onClick={() => window.navigate('/vendor/reservations')}
              >
                <h4>View Reservations</h4>
                <p>See all customer bookings and reservations</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
