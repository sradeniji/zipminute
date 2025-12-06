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

// Health endpoint tests
const runHealthTests = async () => {
  console.log('\n🏥 Testing Health Endpoint...\n');
  
  test('Health endpoint returns 200', async () => {
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
  
  test('Health endpoint returns valid JSON', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });
    
    if (!response.body.ok) {
      throw new Error('Response should have ok: true');
    }
    
    if (!response.body.timestamp) {
      throw new Error('Response should have timestamp');
    }
    
    if (!response.body.uptime) {
      throw new Error('Response should have uptime');
    }
  });
  
  test('Health endpoint has CORS headers', async () => {
    const response = await request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });
    
    if (!response.headers['access-control-allow-origin']) {
      throw new Error('Missing CORS headers');
    }
  });
};

// Run tests
runHealthTests().catch(console.error);

