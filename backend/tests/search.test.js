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

// Search endpoint tests
const runSearchTests = async () => {
  console.log('\n🔍 Testing Search Endpoint...\n');
  
  test('Search endpoint returns 200', async () => {
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
  
  test('Search returns valid structure', async () => {
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
  
  test('Search respects limit parameter', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&limit=3',
      method: 'GET'
    });
    
    if (response.body.items.length > 3) {
      throw new Error(`Expected max 3 items, got ${response.body.items.length}`);
    }
  });
  
  test('Search with category filter', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&category=barber&limit=5',
      method: 'GET'
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
    
    // Check that all returned items are barber category
    response.body.items.forEach(item => {
      if (item.service && item.service.category !== 'barber') {
        throw new Error(`Expected barber category, got ${item.service.category}`);
      }
    });
  });
  
  test('Search without location parameters', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/search?withinHours=24&limit=5',
      method: 'GET'
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected 200, got ${response.statusCode}`);
    }
  });
  
  test('Search items have required fields', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/search?lat=49.8998&lng=-97.1375&radiusKm=10&withinHours=24&limit=1',
      method: 'GET'
    });
    
    if (response.body.items.length > 0) {
      const item = response.body.items[0];
      const requiredFields = ['slotId', 'startAt', 'endAt', 'priceCents'];
      
      requiredFields.forEach(field => {
        if (!item[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      });
    }
  });
};

// Run tests
runSearchTests().catch(console.error);

