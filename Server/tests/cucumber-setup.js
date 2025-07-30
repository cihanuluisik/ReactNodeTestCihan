const TestDatabase = require('./helpers/testDatabase');
const { createTestServer } = require('./helpers/testServer');
const { setupValidationSchemas } = require('./helpers/validationSetup');

// Global test database instance
global.testDatabase = new TestDatabase();

// No global modules needed for E2E tests

// Global test server instance
let testServerApp;
let testServerInstance;

// Setup function for Cucumber
async function setup() {
  try {
    // Start test database
    await global.testDatabase.start();
    console.log('✅ Test database started');

    // Create and start test server
    testServerApp = await createTestServer();
    testServerInstance = testServerApp.listen(0, () => {
      const port = testServerInstance.address().port;
      console.log(`🌐 Test server running on port ${port}`);
    });
    
    // Make test server available globally
    global.testServer = testServerApp;

    // Setup default validation schemas for tests
    await setupValidationSchemas();

    console.log('🚀 Cucumber Test Setup Complete');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Teardown function for Cucumber
async function teardown() {
  try {
    // Stop test server
    if (testServerInstance) {
      testServerInstance.close();
      console.log('✅ Test server stopped');
    }

    // Stop test database
    await global.testDatabase.stop();
    console.log('✅ Test database stopped');

    console.log('✅ Cucumber Test Teardown Complete');
  } catch (error) {
    console.error('❌ Teardown failed:', error);
    throw error;
  }
}

// Export setup and teardown functions
module.exports = { setup, teardown };

// Export setup function for manual calling
module.exports.setup = setup;
module.exports.teardown = teardown;

// Handle process termination
process.on('SIGINT', async () => {
  await teardown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await teardown();
  process.exit(0);
});

 