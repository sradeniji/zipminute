import datastore from '../store/datastore.js';
import ids from '../store/ids.js';

const { serviceId } = ids;

// Get vendor services
const getServices = (req, res) => {
  try {
    // For MVP, use hardcoded vendor ID or from header
    const vendorId = req.headers['x-vendor-id'] || 'vnd_demo_1';
    
    const state = datastore.getState();
    const services = state.services.filter(service => service.vendorId === vendorId);
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(services));
    
  } catch (error) {
    console.error('Get services error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to get services' }));
  }
};

// Create new service
const createService = async (req, res, body) => {
  try {
    const { name, category, durationMinutes, description, priceCents } = body;
    
    // Validation
    if (!name || !category || !durationMinutes || priceCents === undefined) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }
    
    if (durationMinutes <= 0) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Duration must be positive' }));
      return;
    }
    
    if (priceCents < 0) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Price must be non-negative' }));
      return;
    }
    
    // For MVP, use hardcoded vendor ID or from header
    const vendorId = req.headers['x-vendor-id'] || 'vnd_demo_1';
    
    // Create service
    const service = {
      id: serviceId(),
      vendorId,
      name,
      category,
      durationMinutes,
      description: description || null,
      priceCents,
      createdAt: new Date().toISOString()
    };
    
    // Add to datastore
    datastore.addItem('services', service);
    await datastore.save(['services']);
    
    res.writeHead(201, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(service));
    
  } catch (error) {
    console.error('Create service error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to create service' }));
  }
};

// Get vendor slots
const getSlots = (req, res) => {
  try {
    // For MVP, use hardcoded vendor ID or from header
    const vendorId = req.headers['x-vendor-id'] || 'vnd_demo_1';
    
    const state = datastore.getState();
    const indexes = datastore.getIndexes();
    
    // Get vendor's services
    const vendorServices = state.services.filter(service => service.vendorId === vendorId);
    const serviceIds = vendorServices.map(service => service.id);
    
    // Get slots for these services
    const slots = state.slots.filter(slot => serviceIds.includes(slot.serviceId));
    
    // Add service and booking info to each slot
    const slotsWithDetails = slots.map(slot => {
      const service = indexes.byServiceId[slot.serviceId];
      const bookings = indexes.bookingsBySlotId[slot.id] || [];
      
      return {
        ...slot,
        service: service ? {
          id: service.id,
          name: service.name,
          category: service.category,
          durationMinutes: service.durationMinutes
        } : null,
        bookings: bookings.map(booking => ({
          id: booking.id,
          status: booking.status,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          holdExpiresAt: booking.holdExpiresAt
        }))
      };
    });
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(slotsWithDetails));
    
  } catch (error) {
    console.error('Get slots error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to get slots' }));
  }
};

export default {
  getServices,
  createService,
  getSlots
};


