import datastore from '../store/datastore.js';
import geo from '../store/geo.js';
import time from '../store/time.js';

const { distanceKm } = geo;
const { getTimeWindow, withinWindow } = time;

// Search endpoint - time-first discovery
const get = (req, res, parsedUrl) => {
  try {
    const params = parsedUrl.searchParams;
    
    // Parse search parameters
    const lat = parseFloat(params.get('lat'));
    const lng = parseFloat(params.get('lng'));
    const radiusKm = parseFloat(params.get('radiusKm')) || 50;
    const withinHours = parseFloat(params.get('withinHours'));
    const category = params.get('category');
    const limit = parseInt(params.get('limit')) || 20;
    const offset = parseInt(params.get('offset')) || 0;
    
    // Get time window
    let timeWindow;
    if (withinHours) {
      timeWindow = getTimeWindow(withinHours);
    } else {
      const from = params.get('from');
      const to = params.get('to');
      if (from && to) {
        timeWindow = { from, to };
      } else {
        // Default to next 24 hours
        timeWindow = getTimeWindow(24);
      }
    }
    
    // Get state and indexes
    const state = datastore.getState();
    const indexes = datastore.getIndexes();
    
    // Start with open slots
    let slots = indexes.slotsByStatus.OPEN || [];
    
    // Filter by time window
    slots = slots.filter(slot => withinWindow(slot, timeWindow.from, timeWindow.to));
    
    // Filter by category if specified
    if (category) {
      slots = slots.filter(slot => {
        const service = indexes.byServiceId[slot.serviceId];
        return service && service.category === category;
      });
    }
    
    // Filter by location if specified
    if (lat && lng) {
      slots = slots.filter(slot => {
        const service = indexes.byServiceId[slot.serviceId];
        if (!service) return false;
        
        const vendor = indexes.byVendorId[service.vendorId];
        if (!vendor) return false;
        
        const locations = indexes.locationsByVendorId[vendor.id] || [];
        const primaryLocation = locations.find(loc => loc.isPrimary) || locations[0];
        
        if (!primaryLocation) return false;
        
        const distance = distanceKm(lat, lng, primaryLocation.lat, primaryLocation.lng);
        return distance <= radiusKm;
      });
    }
    
    // Sort by start time, then by distance if location provided
    slots.sort((a, b) => {
      const timeA = new Date(a.startAt);
      const timeB = new Date(b.startAt);
      
      if (timeA.getTime() !== timeB.getTime()) {
        return timeA - timeB;
      }
      
      // If same time, sort by distance if location provided
      if (lat && lng) {
        const serviceA = indexes.byServiceId[a.serviceId];
        const serviceB = indexes.byServiceId[b.serviceId];
        
        if (serviceA && serviceB) {
          const vendorA = indexes.byVendorId[serviceA.vendorId];
          const vendorB = indexes.byVendorId[serviceB.vendorId];
          
          if (vendorA && vendorB) {
            const locA = (indexes.locationsByVendorId[vendorA.id] || []).find(loc => loc.isPrimary) || (indexes.locationsByVendorId[vendorA.id] || [])[0];
            const locB = (indexes.locationsByVendorId[vendorB.id] || []).find(loc => loc.isPrimary) || (indexes.locationsByVendorId[vendorB.id] || [])[0];
            
            if (locA && locB) {
              const distA = distanceKm(lat, lng, locA.lat, locA.lng);
              const distB = distanceKm(lat, lng, locB.lat, locB.lng);
              return distA - distB;
            }
          }
        }
      }
      
      return 0;
    });
    
    // Paginate
    const total = slots.length;
    const paginatedSlots = slots.slice(offset, offset + limit);
    
    // Build response items
    const items = paginatedSlots.map(slot => {
      const service = indexes.byServiceId[slot.serviceId];
      const vendor = service ? indexes.byVendorId[service.vendorId] : null;
      const locations = vendor ? indexes.locationsByVendorId[vendor.id] || [] : [];
      const primaryLocation = locations.find(loc => loc.isPrimary) || locations[0];
      
      const item = {
        slotId: slot.id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        priceCents: slot.priceCents,
        service: service ? {
          id: service.id,
          name: service.name,
          category: service.category,
          durationMinutes: service.durationMinutes
        } : null,
        vendor: vendor ? {
          id: vendor.id,
          name: vendor.name,
          rating: vendor.rating
        } : null,
        location: primaryLocation ? {
          id: primaryLocation.id,
          name: primaryLocation.name,
          address: primaryLocation.address,
          lat: primaryLocation.lat,
          lng: primaryLocation.lng
        } : null
      };
      
      // Add distance if location search
      if (lat && lng && primaryLocation) {
        item.distanceKm = distanceKm(lat, lng, primaryLocation.lat, primaryLocation.lng);
      }
      
      return item;
    });
    
    const response = {
      total,
      items,
      filters: {
        lat,
        lng,
        radiusKm,
        withinHours,
        category,
        timeWindow
      }
    };
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(response));
    
  } catch (error) {
    console.error('Search error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Search failed' }));
  }
};

export default {
  get
};


