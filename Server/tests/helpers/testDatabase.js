const { GenericContainer } = require("testcontainers");
const mongoose = require('mongoose');

class TestDatabase {
  constructor() {
    this.container = null;
    this.connection = null;
  }

  async start() {
    try {
      console.log('🚀 Starting MongoDB test container...');
      
      this.container = await new GenericContainer("mongo:5.0")
        .withExposedPorts(27017)
        .start();

      const mongoUri = `mongodb://${this.container.getHost()}:${this.container.getMappedPort(27017)}/test-db`;
      console.log(`📡 MongoDB test container started at: ${mongoUri}`);

      // Connect to the test database
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('✅ Test database connected successfully');
      
      // Set the test database URI for the application
      process.env.DB_URL = mongoUri;
      process.env.DB = 'test-db';
      
      return mongoUri;
    } catch (error) {
      console.error('❌ Failed to start test database:', error);
      throw error;
    }
  }

  async stop() {
    try {
      console.log('🛑 Stopping MongoDB test container...');
      
      if (this.connection) {
        await mongoose.disconnect();
        console.log('✅ Database connection closed');
      }
      
      if (this.container) {
        await this.container.stop();
        console.log('✅ MongoDB test container stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping test database:', error);
      throw error;
    }
  }

  async clear() {
    try {
      if (this.connection) {
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
          await collection.deleteMany({});
        }
        console.log('🧹 Test database cleared');
      }
    } catch (error) {
      console.error('❌ Error clearing test database:', error);
      throw error;
    }
  }

  async seed() {
    try {
      // Import the database config to seed default data
      const dbConfig = require('../../db/config');
      
      // Seed default admin user
      const User = require('../../model/schema/user');
      
      // Check if admin user exists
      const existingAdmin = await User.findOne({ username: 'admin@gmail.com' });
      if (!existingAdmin) {
        const bcrypt = require('bcrypt');
        const { config } = require('../../config/environment');
        
        const hashedPassword = await bcrypt.hash('admin123', config.security.bcryptSaltRounds);
        
        await User.create({
          username: 'admin@gmail.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: 1234567890,
          role: 'superAdmin',
          deleted: false
        });
        
        console.log('👤 Default admin user seeded');
      }
    } catch (error) {
      console.error('❌ Error seeding test database:', error);
      throw error;
    }
  }
}

module.exports = TestDatabase; 