import datastore from '../store/datastore.js';
import ids from '../store/ids.js';

const { slotId } = ids;

// Get slot by ID with full details
const getById = (req, res, slotId) => {
  try {
    const state = datastore.getState();
    const indexes = datastore.getIndexes();
    
    const slot = datastore.getById('slots', slotId);
    if (!slot) {
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Slot not found' }));
      return;
    }
    
    // Get related data
    const service = indexes.byServiceId[slot.serviceId];
    const vendor = service ? indexes.byVendorId[service.vendorId] : null;
    const locations = vendor ? indexes.locationsByVendorId[vendor.id] || [] : [];
    const primaryLocation = locations.find(loc => loc.isPrimary) || locations[0];
    
    const response = {
      id: slot.id,
      startAt: slot.startAt,
      endAt: slot.endAt,
      priceCents: slot.priceCents,
      status: slot.status,
      service: service ? {
        id: service.id,
        name: service.name,
        category: service.category,
        durationMinutes: service.durationMinutes,
        description: service.description
      } : null,
      vendor: vendor ? {
        id: vendor.id,
        name: vendor.name,
        rating: vendor.rating,
        phone: vendor.phone,
        email: vendor.email
      } : null,
      location: primaryLocation ? {
        id: primaryLocation.id,
        name: primaryLocation.name,
        address: primaryLocation.address,
        lat: primaryLocation.lat,
        lng: primaryLocation.lng
      } : null
    };
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(response));
    
  } catch (error) {
    console.error('Get slot error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to get slot' }));
  }
};

// Create new slot
const create = async (req, res, body) => {
  try {
    const { serviceId, startAt, endAt, priceCents } = body;
    
    // Validation
    if (!serviceId || !startAt || !endAt || priceCents === undefined) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }
    
    if (new Date(startAt) >= new Date(endAt)) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Start time must be before end time' }));
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
    
    // Check if service exists
    const service = datastore.getById('services', serviceId);
    if (!service) {
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Service not found' }));
      return;
    }
    
    // Create slot
    const slot = {
      id: slotId(),
      serviceId,
      startAt,
      endAt,
      priceCents,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    
    // Add to datastore
    datastore.addItem('slots', slot);
    await datastore.save(['slots']);
    
    res.writeHead(201, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(slot));
    
  } catch (error) {
    console.error('Create slot error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to create slot' }));
  }
};

// Update slot
const update = async (req, res, slotId, body) => {
  try {
    const slot = datastore.getById('slots', slotId);
    if (!slot) {
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Slot not found' }));
      return;
    }
    
    // Check if slot can be updated
    if (slot.status === 'BOOKED') {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Cannot update booked slot' }));
      return;
    }
    
    // Update allowed fields
    const updates = {};
    if (body.priceCents !== undefined) {
      if (body.priceCents < 0) {
        res.writeHead(400, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Price must be non-negative' }));
        return;
      }
      updates.priceCents = body.priceCents;
    }
    
    if (body.startAt !== undefined) {
      updates.startAt = body.startAt;
    }
    
    if (body.endAt !== undefined) {
      updates.endAt = body.endAt;
    }
    
    if (body.status !== undefined) {
      // Only allow certain status transitions
      if (['OPEN', 'HELD'].includes(body.status)) {
        updates.status = body.status;
      }
    }
    
    // Validate time if both start and end are provided
    if (updates.startAt && updates.endAt) {
      if (new Date(updates.startAt) >= new Date(updates.endAt)) {
        res.writeHead(400, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Start time must be before end time' }));
        return;
      }
    }
    
    // Update slot
    datastore.updateItem('slots', slotId, updates);
    await datastore.save(['slots']);
    
    const updatedSlot = datastore.getById('slots', slotId);
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(updatedSlot));
    
  } catch (error) {
    console.error('Update slot error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to update slot' }));
  }
};

// Delete slot
const deleteSlot = async (req, res, slotId) => {
  try {
    const slot = datastore.getById('slots', slotId);
    if (!slot) {
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Slot not found' }));
      return;
    }
    
    // Check if slot can be deleted
    if (slot.status === 'BOOKED') {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Cannot delete booked slot' }));
      return;
    }
    
    // Remove slot
    datastore.removeItem('slots', slotId);
    await datastore.save(['slots']);
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ message: 'Slot deleted' }));
    
  } catch (error) {
    console.error('Delete slot error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to delete slot' }));
  }
};

export default {
  getById,
  create,
  update,
  delete: deleteSlot
};


