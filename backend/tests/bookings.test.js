const http = require('http');

// Simple test runner
const test = (name, fn) => {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
};

// Helper to make HTTP requests
const request = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, body: jsonBody, headers: res.headers });
        } catch (error) {
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Bookings endpoint tests
const runBookingTests = async () => {
  console.log('\n📅 Testing Bookings Endpoint...\n');
  
  let testSlotId = null;
  let testBookingId = null;
  
  // First, get a slot to test with
  test('Get a slot for booking tests', async () => {
    const searchResponse = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&limit=1',
      method: 'GET'
    });
    
    if (searchResponse.body.items.length === 0) {
      throw new Error('No slots available for testing');
    }
    
    testSlotId = searchResponse.body.items[0].slotId;
    console.log(`Using slot: ${testSlotId}`);
  });
  
  test('Create booking with valid data', async () => {
    const bookingData = {
      slotId: testSlotId,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '555-1234'
    };
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, bookingData);
    
    if (response.statusCode !== 201) {
      throw new Error(`Expected 201, got ${response.statusCode}`);
    }
    
    if (!response.body.bookingId) {
      throw new Error('Response should have bookingId');
    }
    
    if (response.body.status !== 'PENDING') {
      throw new Error('Booking should be PENDING');
    }
    
    if (!response.body.holdExpiresAt) {
      throw new Error('Booking should have holdExpiresAt');
    }
    
    testBookingId = response.body.bookingId;
  });
  
  test('Create booking with missing required fields', async () => {
    const bookingData = {
      slotId: testSlotId,
      customerName: 'Test Customer'
      // Missing email
    };
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, bookingData);
    
    if (response.statusCode !== 400) {
      throw new Error(`Expected 400 for missing fields, got ${response.statusCode}`);
    }
  });
  
  test('Confirm booking', async () => {
    if (!testBookingId) {
      throw new Error('No booking ID available for confirmation test');
    }
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/bookings/${testBookingId}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { action: 'confirm' });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200 for confirmation, got ${response.statusCode}`);
    }
    
    if (response.body.status !== 'CONFIRMED') {
      throw new Error('Booking should be CONFIRMED after confirmation');
    }
  });
  
  test('Try to book already booked slot', async () => {
    const bookingData = {
      slotId: testSlotId,
      customerName: 'Another Customer',
      customerEmail: 'another@example.com'
    };
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, bookingData);
    
    if (response.statusCode !== 400) {
      throw new Error(`Expected 400 for already booked slot, got ${response.statusCode}`);
    }
  });
  
  test('Confirm non-existent booking', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/bookings/nonexistent',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { action: 'confirm' });
    
    if (response.statusCode !== 404) {
      throw new Error(`Expected 404 for non-existent booking, got ${response.statusCode}`);
    }
  });
};

// Run tests
runBookingTests().catch(console.error);

