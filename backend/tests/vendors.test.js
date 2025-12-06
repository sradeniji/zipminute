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

// Vendor endpoint tests
const runVendorTests = async () => {
  console.log('\n🏪 Testing Vendor Endpoints...\n');
  
  let testServiceId = null;
  let testSlotId = null;
  const vendorId = 'vnd_demo_1';
  
  test('Get vendor services', async () => {
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
    
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });
  
  test('Create vendor service', async () => {
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
    
    if (!response.body.id) {
      throw new Error('Service should have an ID');
    }
    
    if (response.body.name !== serviceData.name) {
      throw new Error('Service name should match');
    }
    
    if (response.body.vendorId !== vendorId) {
      throw new Error('Service should belong to the vendor');
    }
    
    testServiceId = response.body.id;
  });
  
  test('Create service with invalid data', async () => {
    const serviceData = {
      name: 'Test Service',
      category: 'barber',
      durationMinutes: -5, // Invalid negative duration
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
    
    if (response.statusCode !== 400) {
      throw new Error(`Expected 400 for invalid data, got ${response.statusCode}`);
    }
  });
  
  test('Get vendor slots', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/vendors/me/slots',
      method: 'GET',
      headers: {
        'x-vendor-id': vendorId
      }
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
    
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });
  
  test('Create vendor slot', async () => {
    if (!testServiceId) {
      throw new Error('No service ID available for slot creation');
    }
    
    const slotData = {
      serviceId: testServiceId,
      startAt: '2025-10-19T10:00:00.000Z',
      endAt: '2025-10-19T10:30:00.000Z',
      priceCents: 3000
    };
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/slots',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      }
    }, slotData);
    
    if (response.statusCode !== 201) {
      throw new Error(`Expected 201, got ${response.statusCode}`);
    }
    
    if (!response.body.id) {
      throw new Error('Slot should have an ID');
    }
    
    if (response.body.status !== 'OPEN') {
      throw new Error('New slot should be OPEN');
    }
    
    testSlotId = response.body.id;
  });
  
  test('Create slot with invalid time', async () => {
    if (!testServiceId) {
      throw new Error('No service ID available for slot creation');
    }
    
    const slotData = {
      serviceId: testServiceId,
      startAt: '2025-10-19T10:30:00.000Z', // Start after end
      endAt: '2025-10-19T10:00:00.000Z',
      priceCents: 3000
    };
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/slots',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      }
    }, slotData);
    
    if (response.statusCode !== 400) {
      throw new Error(`Expected 400 for invalid time, got ${response.statusCode}`);
    }
  });
  
  test('Update slot', async () => {
    if (!testSlotId) {
      throw new Error('No slot ID available for update test');
    }
    
    const updateData = {
      priceCents: 3500
    };
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/slots/${testSlotId}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-vendor-id': vendorId
      }
    }, updateData);
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200 for update, got ${response.statusCode}`);
    }
    
    if (response.body.priceCents !== 3500) {
      throw new Error('Price should be updated');
    }
  });
  
  test('Delete slot', async () => {
    if (!testSlotId) {
      throw new Error('No slot ID available for delete test');
    }
    
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/slots/${testSlotId}`,
      method: 'DELETE',
      headers: {
        'x-vendor-id': vendorId
      }
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200 for delete, got ${response.statusCode}`);
    }
  });
};

// Run tests
runVendorTests().catch(console.error);

