module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Setup and teardown files
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  
  // Test timeout (60 seconds for E2E tests with container startup)
  testTimeout: 60000,
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    '../services/**/*.js',
    '../controllers/**/*.js',
    '../middlewares/**/*.js',
    '../model/schema/**/*.js',
    '../db/**/*.js',
    '../config/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  
  // Verbose output for debugging
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Restore mocks between tests
  restoreMocks: true
}; 