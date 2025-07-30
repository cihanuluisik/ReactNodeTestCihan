const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Environment configuration with validation and defaults
const config = {
  // Database Configuration
  database: {
    url: process.env.DB_URL || 'mongodb://admin:admin123@127.0.0.1:27017',
    name: process.env.DB || 'Prolink'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    loginTimeoutMinutes: parseInt(process.env.LOGIN_TIMEOUT_MINUTES) || 15
  },

  // API Configuration
  api: {
    basePath: process.env.API_BASE_PATH || '/api',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Default Users
  defaultUsers: process.env.DEFAULT_USERS ? 
    process.env.DEFAULT_USERS.split(',').map(email => email.trim()) : 
    ['admin@gmail.com']
};

// Validation function
const validateConfig = () => {
  const errors = [];

  // Validate JWT secret
  if (!config.jwt.secret || config.jwt.secret === 'default_jwt_secret_change_in_production') {
    errors.push('JWT_SECRET must be set in production environment');
  }

  // Validate database URL
  if (!config.database.url) {
    errors.push('DB_URL must be set');
  }

  // Validate required fields
  if (config.security.bcryptSaltRounds < 10) {
    errors.push('BCRYPT_SALT_ROUNDS must be at least 10');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:');
    errors.forEach(error => console.error(`- ${error}`));
    
    if (config.server.nodeEnv === 'production') {
      throw new Error('Configuration validation failed');
    }
  }

  return true;
};

// Export configuration and validation
module.exports = {
  config,
  validateConfig
}; 