const TestDatabase = require('./helpers/testDatabase');
const { createTestServer } = require('./helpers/testServer');
const { setupValidationSchemas } = require('./helpers/validationSetup');

// Global test database instance
global.testDatabase = new TestDatabase();

// Global test server instance
let testServerApp;
let testServerInstance;

// Setup function for Jest
beforeAll(async () => {
  try {
    // Start test database
    await global.testDatabase.start();
    console.log('✅ Test database started for Jest');

    // Wait a moment for database to be fully ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Setup default validation schemas for tests
    await setupValidationSchemas();

    // Create and start test server
    testServerApp = await createTestServer();
    testServerInstance = testServerApp.listen(0, () => {
      const port = testServerInstance.address().port;
      console.log(`🌐 Test server running on port ${port} for Jest`);
    });
    
    // Make test server available globally
    global.testServer = testServerApp;

    console.log('🚀 Jest Test Setup Complete');
  } catch (error) {
    console.error('❌ Jest Setup failed:', error);
    throw error;
  }
});

// Teardown function for Jest
afterAll(async () => {
  try {
    // Stop test server
    if (testServerInstance) {
      testServerInstance.close();
      console.log('✅ Test server stopped for Jest');
    }

    // Stop test database
    await global.testDatabase.stop();
    console.log('✅ Test database stopped for Jest');

    console.log('✅ Jest Test Teardown Complete');
  } catch (error) {
    console.error('❌ Jest Teardown failed:', error);
    throw error;
  }
});

// Handle process termination
process.on('SIGINT', async () => {
  if (testServerInstance) {
    testServerInstance.close();
  }
  await global.testDatabase.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (testServerInstance) {
    testServerInstance.close();
  }
  await global.testDatabase.stop();
  process.exit(0);
});

 