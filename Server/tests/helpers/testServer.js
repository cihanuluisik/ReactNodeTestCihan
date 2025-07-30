const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const route = require('../../controllers/route');
const { config } = require('../../config/environment');
const db = require('../../db/config');

// Create test server instance
const createTestServer = async () => {
  const app = express();
  
  // Middleware
  app.use(cors());
  
  // Configure body parser with size limit (1MB)
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
  
  // Error handling middleware for oversized requests
  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 413) {
      return res.status(413).json({ error: 'Request body too large' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body too large' });
    }
    next(error);
  });
  
  // Connect to test database and ensure all models are loaded
  await db(process.env.DB_URL, process.env.DB);
  
  // API Routes
  app.use(config.api.basePath, route);
  
  // Test endpoint
  app.get('/', (req, res) => {
    res.send('Test server running');
  });
  
  return app;
};

module.exports = { createTestServer }; 