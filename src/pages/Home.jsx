import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';

const Home = () => {
  const { state, actions } = useStore();
  const [formData, setFormData] = useState({
    category: state.search.filters.category || '',
    withinHours: state.search.filters.withinHours || 24,
    radiusKm: state.search.filters.radiusKm || 10,
    lat: state.search.filters.lat || '',
    lng: state.search.filters.lng || ''
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lastMinuteNow_preferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...preferences }));
      } catch (error) {
        console.warn('Could not load saved preferences:', error);
      }
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        }));
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your location. Please enter it manually.');
        setLoading(false);
      }
    );
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.lat || !formData.lng) {
      alert('Please provide your location or use "Get My Location"');
      return;
    }

    // Save preferences
    const preferences = {
      category: formData.category,
      withinHours: formData.withinHours,
      radiusKm: formData.radiusKm,
      lat: formData.lat,
      lng: formData.lng
    };
    localStorage.setItem('lastMinuteNow_preferences', JSON.stringify(preferences));

    // Update store
    actions.setSearchFilters(preferences);

    // Build search URL
    const searchParams = new URLSearchParams({
      lat: formData.lat,
      lng: formData.lng,
      radiusKm: formData.radiusKm,
      withinHours: formData.withinHours
    });
    
    if (formData.category) {
      searchParams.set('category', formData.category);
    }

    // Navigate to search
    window.navigate('/search', searchParams.toString());
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="home-page">
      <div className="container">
        <header className="hero">
          <h1>Last Minute Now</h1>
          <p className="hero-subtitle">
            Find available services near you, right now
          </p>
          <div className="hero-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => window.navigate('/vendor/register')}
            >
              Become a Vendor
            </button>
          </div>
        </header>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Service Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">Any Category</option>
              <option value="barber">Barber</option>
              <option value="massage">Massage</option>
              <option value="nails">Nails</option>
              <option value="tattoo">Tattoo</option>
              <option value="plumber">Plumber</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Time Window</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="withinHours"
                  value="2"
                  checked={formData.withinHours === 2}
                  onChange={(e) => handleInputChange('withinHours', parseInt(e.target.value))}
                />
                <span>Next 2 hours</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="withinHours"
                  value="24"
                  checked={formData.withinHours === 24}
                  onChange={(e) => handleInputChange('withinHours', parseInt(e.target.value))}
                />
                <span>Next 24 hours</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="withinHours"
                  value="72"
                  checked={formData.withinHours === 72}
                  onChange={(e) => handleInputChange('withinHours', parseInt(e.target.value))}
                />
                <span>Next 3 days</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Search Radius</label>
            <select
              className="form-select"
              value={formData.radiusKm}
              onChange={(e) => handleInputChange('radiusKm', parseInt(e.target.value))}
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <button
              type="button"
              className="btn btn-secondary mb-md"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              {loading ? 'Getting Location...' : 'Get My Location'}
            </button>
            
            <div className="location-inputs">
              <input
                type="number"
                className="form-input"
                placeholder="Latitude"
                value={formData.lat}
                onChange={(e) => handleInputChange('lat', e.target.value)}
                step="0.000001"
              />
              <input
                type="number"
                className="form-input"
                placeholder="Longitude"
                value={formData.lng}
                onChange={(e) => handleInputChange('lng', e.target.value)}
                step="0.000001"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!formData.lat || !formData.lng}
          >
            Find Available Services
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
