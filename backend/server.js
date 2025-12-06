import http from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';
import router from './router.js';
import { init } from './init.js';

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = http.createServer((req, res) => {
  // Basic request logging in development
  if (NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  }
  
  // Route the request
  router(req, res);
});

// Initialize datastore and start server
const startServer = async () => {
  try {
    await init();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
