import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import SlotCard from '../components/SlotCard';
import { searchSlots } from '../utils/api';

const Search = ({ searchParams }) => {
  const { state, actions } = useStore();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    radiusKm: parseInt(searchParams.get('radiusKm')) || 10,
    withinHours: parseInt(searchParams.get('withinHours')) || 24
  });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load search results
  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const performSearch = async () => {
    try {
      actions.setSearchLoading(true);
      
      const params = {
        lat: parseFloat(searchParams.get('lat')),
        lng: parseFloat(searchParams.get('lng')),
        radiusKm: filters.radiusKm,
        withinHours: filters.withinHours,
        limit: 20,
        offset: offset
      };

      if (filters.category) {
        params.category = filters.category;
      }

      const data = await searchSlots(params);

      if (offset === 0) {
        actions.setSearchResults(data.items);
      } else {
        actions.setSearchResults([...state.search.results, ...data.items]);
      }
      setHasMore(data.items.length === 20);
    } catch (error) {
      console.error('Search error:', error);
      actions.setSearchError(error.message || 'Network error');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setOffset(0);
  };

  const handleLoadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    // Trigger new search with new offset
    performSearch();
  };

  const handleSlotClick = (slot) => {
    window.navigate(`/slot/${slot.slotId}`);
  };

  const handleBackToSearch = () => {
    const params = new URLSearchParams({
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radiusKm: filters.radiusKm,
      withinHours: filters.withinHours
    });
    
    if (filters.category) {
      params.set('category', filters.category);
    }

    window.navigate('/search', params.toString());
  };

  return (
    <div className="search-page">
      <div className="container">
        <header className="search-header">
          <button 
            className="btn btn-secondary"
            onClick={() => window.navigate('/')}
          >
            ← Back to Search
          </button>
          <h1>Available Services</h1>
        </header>

        <div className="search-filters">
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="barber">Barber</option>
              <option value="massage">Massage</option>
              <option value="nails">Nails</option>
              <option value="tattoo">Tattoo</option>
              <option value="plumber">Plumber</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Radius</label>
            <select
              className="filter-select"
              value={filters.radiusKm}
              onChange={(e) => handleFilterChange('radiusKm', parseInt(e.target.value))}
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Time Window</label>
            <select
              className="filter-select"
              value={filters.withinHours}
              onChange={(e) => handleFilterChange('withinHours', parseInt(e.target.value))}
            >
              <option value="2">Next 2 hours</option>
              <option value="24">Next 24 hours</option>
              <option value="72">Next 3 days</option>
            </select>
          </div>
        </div>

        {state.search.loading && (
          <div className="loading">
            <p>Searching for available services...</p>
          </div>
        )}

        {state.search.error && (
          <div className="error">
            <p>Error: {state.search.error}</p>
            <button 
              className="btn btn-primary"
              onClick={performSearch}
            >
              Try Again
            </button>
          </div>
        )}

        {!state.search.loading && !state.search.error && (
          <>
            <div className="search-results">
              <p className="results-count">
                Found {state.search.results.length} available services
              </p>
              
              <div className="slots-grid">
                {state.search.results.map((slot) => (
                  <SlotCard
                    key={slot.slotId}
                    slot={slot}
                    onClick={() => handleSlotClick(slot)}
                  />
                ))}
              </div>
            </div>

            {hasMore && (
              <div className="load-more">
                <button 
                  className="btn btn-primary"
                  onClick={handleLoadMore}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
