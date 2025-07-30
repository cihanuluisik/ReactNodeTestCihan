const express = require('express');
const path = require('path');
const db = require('./db/config')
const route = require('./controllers/route');
const bodyParser = require('body-parser');
const cors = require('cors');
const { config, validateConfig } = require('./config/environment');
const { generateAndServeDocs } = require('./middlewares/apidoc');

// Validate configuration on startup
validateConfig();

//Setup Express App
const app = express();
// Middleware
app.use(bodyParser.json());
// Set up CORS  
app.use(cors())

// API Documentation Routes
app.get('/api/docs', generateAndServeDocs);
app.use('/api/docs', express.static(path.join(__dirname, 'public/docs')));
app.use('/api/assets', express.static(path.join(__dirname, 'public/docs/assets')));

// Test Coverage Reports
app.use('/tests/coverage', express.static(path.join(__dirname, 'tests/coverage')));

//API Routes
app.use(config.api.basePath, route);

app.get('/', async (req, res) => {
    res.send('Welcome to my world...')
});

// Get port from environment and store in Express.
const server = app.listen(config.server.port, () => {
    const protocol = (config.server.nodeEnv === 'production') ? 'https' : 'http';
    const { address, port } = server.address();
    const host = address === '::' ? '127.0.0.1' : address;
    console.log(`Server listening at ${protocol}://${host}:${port}/`);
    console.log(`Environment: ${config.server.nodeEnv}`);
    console.log(`JWT Secret configured: ${config.jwt.secret !== 'default_jwt_secret_change_in_production'}`);
});

// Connect to MongoDB
db(config.database.url, config.database.name);

// Export app for testing
module.exports = app;
