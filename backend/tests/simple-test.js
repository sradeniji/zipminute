import http from 'http';

// Simple test runner
const test = async (name, fn) => {
  try {
    await fn();
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

// Test suite runner
const runTests = async () => {
  console.log('🧪 Running Backend Tests...\n');
  console.log('='.repeat(50));
  
  // Check if server is running
  try {
    await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });
    console.log('✅ Server is running on localhost:3001\n');
  } catch (error) {
    console.log('❌ Server is not running. Please start with: node backend/server.js\n');
    return;
  }
  
  // Health tests
  console.log('🏥 Health Endpoint Tests');
  console.log('-'.repeat(30));
  
  await test('Health endpoint returns 200', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
  });
  
  await test('Health endpoint returns valid JSON', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });
    
    if (!response.body.ok) {
      throw new Error('Response should have ok: true');
    }
  });
  
  // Search tests
  console.log('\n🔍 Search Endpoint Tests');
  console.log('-'.repeat(30));
  
  await test('Search endpoint returns 200', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&limit=5',
      method: 'GET'
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
  });
  
  await test('Search returns valid structure', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&limit=5',
      method: 'GET'
    });
    
    if (!response.body.total && response.body.total !== 0) {
      throw new Error('Response should have total field');
    }
    
    if (!Array.isArray(response.body.items)) {
      throw new Error('Response should have items array');
    }
  });
  
  // Booking tests
  console.log('\n📅 Booking Endpoint Tests');
  console.log('-'.repeat(30));
  
  let testSlotId = null;
  
  await test('Get a slot for booking tests', async () => {
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
  });
  
  await test('Create booking with valid data', async () => {
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
  });
  
  // Vendor tests
  console.log('\n🏪 Vendor Endpoint Tests');
  console.log('-'.repeat(30));
  
  const vendorId = 'vnd_demo_1';
  
  await test('Get vendor services', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/vendors/me/services',
      method: 'GET',
      headers: {
        'x-vendor-id': vendorId
      }
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
  });
  
  await test('Create vendor service', async () => {
    const serviceData = {
      name: 'Test Service',
      category: 'barber',
      durationMinutes: 30,
      description: 'A test service for testing',
      priceCents: 2500
    };
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/vendors/me/services',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      }
    }, serviceData);
    
    if (response.statusCode !== 201) {
      throw new Error(`Expected 201, got ${response.statusCode}`);
    }
  });
  
  // Frontend serving test
  console.log('\n🌐 Frontend Serving Tests');
  console.log('-'.repeat(30));
  
  await test('Frontend HTML is served', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'GET'
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
    
    if (!response.body.includes('Last Minute Now')) {
      throw new Error('HTML should contain "Last Minute Now"');
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 All tests completed!');
  console.log('='.repeat(50));
};

// Run all tests
runTests().catch(console.error);

