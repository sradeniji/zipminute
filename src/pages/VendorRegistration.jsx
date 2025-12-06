import React, { useState } from 'react';
import { useStore } from '../context/Store';

const VendorRegistration = () => {
  const { actions } = useStore();
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    description: '',
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    'barber', 'massage', 'nails', 'tattoo', 'plumber', 'electrician', 
    'hairdresser', 'beauty', 'fitness', 'wellness', 'home', 'automotive'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For now, we'll simulate vendor registration
      // In a real app, this would call a registration API
      const vendorData = {
        id: `vnd_${Date.now()}`,
        name: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.province} ${formData.postalCode}`,
        description: formData.description,
        categories: formData.categories,
        status: 'pending', // Pending approval
        createdAt: new Date().toISOString()
      };

      // Store vendor data in localStorage for demo
      localStorage.setItem('vendor_data', JSON.stringify(vendorData));
      
      // Set vendor in store
      actions.setVendor(vendorData);
      
      setSuccess(true);
      actions.addNotification('Vendor registration submitted successfully!', 'success');
      
      // Redirect to vendor dashboard after a delay
      setTimeout(() => {
        window.navigate('/vendor/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="vendor-registration">
        <div className="container">
          <div className="success-message">
            <h1>✅ Registration Submitted!</h1>
            <p>Thank you for registering as a vendor. Your application is under review.</p>
            <p>You'll receive an email confirmation shortly.</p>
            <div className="redirect-message">
              <p>Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-registration">
      <div className="container">
        <header className="registration-header">
          <button 
            className="btn btn-secondary"
            onClick={() => window.navigate('/')}
          >
            ← Back to Home
          </button>
          <h1>Become a Vendor</h1>
          <p>Join our platform and start offering your services to customers</p>
        </header>

        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Business Information</h3>
            
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person *</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Location</h3>
            
            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-input"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>

            <div className="location-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Province *</label>
                <select
                  className="form-select"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  required
                >
                  <option value="">Select Province</option>
                  <option value="AB">Alberta</option>
                  <option value="BC">British Columbia</option>
                  <option value="MB">Manitoba</option>
                  <option value="NB">New Brunswick</option>
                  <option value="NL">Newfoundland and Labrador</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="ON">Ontario</option>
                  <option value="PE">Prince Edward Island</option>
                  <option value="QC">Quebec</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="NT">Northwest Territories</option>
                  <option value="NU">Nunavut</option>
                  <option value="YT">Yukon</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Services</h3>
            
            <div className="form-group">
              <label className="form-label">Service Categories *</label>
              <div className="category-grid">
                {categories.map(category => (
                  <label key={category} className="category-option">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <span className="category-label">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell customers about your business..."
                rows="4"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || formData.categories.length === 0}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;
