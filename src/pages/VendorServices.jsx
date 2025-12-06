import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { getVendorServices, createService } from '../utils/api';
import { validateService, normalizeService } from '../utils/vendorServices';

const VendorServices = () => {
  const { state } = useStore();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    durationMinutes: 30,
    description: '',
    priceCents: 0
  });
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const vendorId = state.vendor?.id || 'vnd_demo_1';
  const categories = [
    'barber', 'massage', 'nails', 'tattoo', 'plumber', 'electrician',
    'hairdresser', 'beauty', 'fitness', 'wellness', 'home', 'automotive'
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await getVendorServices(vendorId);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      setError(error.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateService(formData);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const normalizedData = normalizeService(formData);
      
      const newService = await createService(normalizedData, vendorId);
      
      // Add to local state
      setServices(prev => [...prev, newService]);
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        durationMinutes: 30,
        description: '',
        priceCents: 0
      });
      setShowAddForm(false);
      setFormErrors([]);
      
    } catch (error) {
      console.error('Error creating service:', error);
      setFormErrors([error.message || 'Failed to create service']);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (priceCents) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="vendor-services">
        <div className="container">
          <div className="loading">
            <p>Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-services">
        <div className="container">
          <div className="error">
            <h2>Error Loading Services</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadServices}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-services">
      <div className="container">
        <header className="services-header">
          <button 
            className="btn btn-secondary"
            onClick={() => window.navigate('/vendor/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <div className="header-content">
            <h1>Manage Services</h1>
            <p>Add and manage your service offerings</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Service'}
          </button>
        </header>

        {showAddForm && (
          <div className="add-service-form">
            <h3>Add New Service</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Haircut & Styling"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.durationMinutes}
                    onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
                    min="15"
                    max="480"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Base Price (cents) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.priceCents}
                    onChange={(e) => handleInputChange('priceCents', parseInt(e.target.value))}
                    min="0"
                    step="100"
                    placeholder="e.g., 5000 for $50.00"
                    required
                  />
                  <small className="form-help">
                    Enter price in cents (e.g., 5000 = $50.00)
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your service..."
                  rows="3"
                />
              </div>

              {formErrors.length > 0 && (
                <div className="form-errors">
                  {formErrors.map((error, index) => (
                    <p key={index} className="error-message">{error}</p>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="services-content">
          <div className="services-list">
            {services.length > 0 ? (
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-header">
                      <h3>{service.name}</h3>
                      <span className="service-category">
                        {service.category}
                      </span>
                    </div>

                    <div className="service-details">
                      <div className="service-info">
                        <p><strong>Duration:</strong> {formatDuration(service.durationMinutes)}</p>
                        <p><strong>Base Price:</strong> {formatPrice(service.priceCents)}</p>
                        {service.description && (
                          <p><strong>Description:</strong> {service.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="service-actions">
                      <button className="btn btn-secondary btn-sm">
                        Edit
                      </button>
                      <button className="btn btn-error btn-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-services">
                <h3>No Services Yet</h3>
                <p>Start by adding your first service to begin accepting bookings.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                >
                  Add Your First Service
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorServices;
