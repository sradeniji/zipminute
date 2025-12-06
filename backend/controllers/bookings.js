import datastore from '../store/datastore.js';
import ids from '../store/ids.js';
import time from '../store/time.js';

const { bookingId } = ids;
const { getHoldExpiry, isHoldExpired } = time;

// Store active timers for hold expiry
const holdTimers = new Map();

// Create booking (hold slot)
const create = async (req, res, body) => {
  try {
    const { slotId, customerName, customerEmail, customerPhone } = body;
    
    // Validation
    if (!slotId || !customerName || !customerEmail) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }
    
    // Check if slot exists and is open
    const slot = datastore.getById('slots', slotId);
    if (!slot) {
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Slot not found' }));
      return;
    }
    
    if (slot.status !== 'OPEN') {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Slot is not available' }));
      return;
    }
    
    // Create booking
    const booking = {
      id: bookingId(),
      slotId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      status: 'PENDING',
      holdExpiresAt: getHoldExpiry(),
      createdAt: new Date().toISOString()
    };
    
    // Update slot status to HELD
    datastore.updateItem('slots', slotId, { status: 'HELD' });
    
    // Add booking to datastore
    datastore.addItem('bookings', booking);
    
    // Save changes
    await datastore.save(['slots', 'bookings']);
    
    // Set timer for hold expiry
    const timer = setTimeout(() => {
      expireHold(booking.id, slotId);
    }, 10 * 60 * 1000); // 10 minutes
    
    holdTimers.set(booking.id, timer);
    
    const response = {
      bookingId: booking.id,
      status: 'PENDING',
      holdExpiresAt: booking.holdExpiresAt,
      slotId: slot.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail
    };
    
    res.writeHead(201, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(response));
    
  } catch (error) {
    console.error('Create booking error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to create booking' }));
  }
};

// Confirm booking
const update = async (req, res, bookingId, body) => {
  try {
    const { action } = body;
    
    if (action !== 'confirm') {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Invalid action' }));
      return;
    }
    
    const booking = datastore.getById('bookings', bookingId);
    if (!booking) {
      res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Booking not found' }));
      return;
    }
    
    // Check if booking is still pending and not expired
    if (booking.status !== 'PENDING') {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Booking is not pending' }));
      return;
    }
    
    if (isHoldExpired(booking.holdExpiresAt)) {
      res.writeHead(400, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: 'Hold has expired' }));
      return;
    }
    
    // Update booking status
    datastore.updateItem('bookings', bookingId, { 
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString()
    });
    
    // Update slot status
    datastore.updateItem('slots', booking.slotId, { status: 'BOOKED' });
    
    // Clear timer
    const timer = holdTimers.get(bookingId);
    if (timer) {
      clearTimeout(timer);
      holdTimers.delete(bookingId);
    }
    
    // Save changes
    await datastore.save(['bookings', 'slots']);
    
    const updatedBooking = datastore.getById('bookings', bookingId);
    
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(updatedBooking));
    
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.writeHead(500, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Failed to confirm booking' }));
  }
};

// Expire hold (called by timer)
const expireHold = async (bookingId, slotId) => {
  try {
    const booking = datastore.getById('bookings', bookingId);
    if (!booking || booking.status !== 'PENDING') {
      return; // Already processed
    }
    
    // Update booking status
    datastore.updateItem('bookings', bookingId, { 
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString()
    });
    
    // Update slot status back to OPEN
    datastore.updateItem('slots', slotId, { status: 'OPEN' });
    
    // Save changes
    await datastore.save(['bookings', 'slots']);
    
    console.log(`Hold expired for booking ${bookingId}, slot ${slotId} released`);
    
  } catch (error) {
    console.error('Error expiring hold:', error);
  }
};

export default {
  create,
  update
};


