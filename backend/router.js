import url from 'url';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import controllers
import healthController from './controllers/health.js';
import searchController from './controllers/search.js';
import slotsController from './controllers/slots.js';
import bookingsController from './controllers/bookings.js';
import vendorsController from './controllers/vendors.js';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vendor-id',
  'Access-Control-Max-Age': '86400'
};

// Helper to send JSON response
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    ...corsHeaders 
  });
  res.end(JSON.stringify(data));
};

// Helper to send error response
const sendError = (res, statusCode, message) => {
  sendJson(res, statusCode, { error: message });
};

// Helper to parse request body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};

// Main router function
const router = async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    // Route API endpoints
    if (pathname.startsWith('/api/')) {
      // Health check
      if (pathname === '/api/health' && method === 'GET') {
        return healthController.get(req, res);
      }

      // Search endpoint
      if (pathname === '/api/search' && method === 'GET') {
        return searchController.get(req, res, parsedUrl);
      }

      // Slots endpoints
      if (pathname.startsWith('/api/slots')) {
        const slotId = pathname.split('/')[3];
        
        if (method === 'GET' && slotId) {
          return slotsController.getById(req, res, slotId);
        }
        if (method === 'POST' && !slotId) {
          const body = await parseBody(req);
          return slotsController.create(req, res, body);
        }
        if (method === 'PATCH' && slotId) {
          const body = await parseBody(req);
          return slotsController.update(req, res, slotId, body);
        }
        if (method === 'DELETE' && slotId) {
          return slotsController.delete(req, res, slotId);
        }
      }

      // Bookings endpoints
      if (pathname.startsWith('/api/bookings')) {
        const bookingId = pathname.split('/')[3];
        
        if (method === 'POST' && !bookingId) {
          const body = await parseBody(req);
          return bookingsController.create(req, res, body);
        }
        if (method === 'PATCH' && bookingId) {
          const body = await parseBody(req);
          return bookingsController.update(req, res, bookingId, body);
        }
      }

      // Vendors endpoints
      if (pathname.startsWith('/api/vendors')) {
        if (pathname === '/api/vendors/me/services' && method === 'GET') {
          return vendorsController.getServices(req, res);
        }
        if (pathname === '/api/vendors/me/services' && method === 'POST') {
          const body = await parseBody(req);
          return vendorsController.createService(req, res, body);
        }
        if (pathname === '/api/vendors/me/slots' && method === 'GET') {
          return vendorsController.getSlots(req, res);
        }
      }

      // 404 for unmatched API routes
      return sendError(res, 404, 'API endpoint not found');
    }

    // Serve static files (for production - serve built React app)
    const distPath = path.join(__dirname, '../dist');
    const indexPath = path.join(distPath, 'index.html');
    
    // Check if dist folder exists (production build)
    if (fs.existsSync(distPath)) {
      // Serve index.html for all non-API routes (SPA routing)
      if (pathname === '/' || pathname === '/index.html' || !pathname.startsWith('/api/')) {
        // Try to serve the requested file first (for assets)
        if (pathname !== '/' && pathname !== '/index.html') {
          const filePath = path.join(distPath, pathname);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath);
            let contentType = 'text/plain';
            
            if (ext === '.js') contentType = 'application/javascript';
            else if (ext === '.jsx') contentType = 'application/javascript';
            else if (ext === '.css') contentType = 'text/css';
            else if (ext === '.html') contentType = 'text/html';
            else if (ext === '.json') contentType = 'application/json';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.ico') contentType = 'image/x-icon';
            else if (ext === '.woff') contentType = 'font/woff';
            else if (ext === '.woff2') contentType = 'font/woff2';
            else if (ext === '.ttf') contentType = 'font/ttf';
            
            try {
              const content = fs.readFileSync(filePath);
              res.writeHead(200, { 'Content-Type': contentType });
              res.end(content);
              return;
            } catch (error) {
              // Fall through to index.html
            }
          }
        }
        
        // Serve index.html for SPA routing
        if (fs.existsSync(indexPath)) {
          const content = fs.readFileSync(indexPath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
          return;
        }
      }
    }

    // 404 for all other routes
    return sendError(res, 404, 'Route not found');

  } catch (error) {
    console.error('Router error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

export default router;
