const mongoose = require('mongoose');
const Validation = require('./model/schema/validation');
const CustomField = require('./model/schema/customField');
const { defaultValidations } = require('./tests/helpers/validationSetup');
const { config } = require('./config/environment');

// Connect to the database using the same configuration as the app
const connectDB = async () => {
  try {
    const DB_OPTIONS = {
      dbName: config.database.name
    };

    mongoose.set("strictQuery", false);
    await mongoose.connect(config.database.url, DB_OPTIONS);
    console.log('✅ Connected to database:', config.database.name);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Setup validation schemas
const setupValidationSchemas = async () => {
  try {
    console.log('🚀 Setting up validation schemas in development database...');

    // Clear existing validation schemas to avoid duplicate key errors
    const schemaNames = defaultValidations.map(v => v.name);
    await Validation.deleteMany({ name: { $in: schemaNames } });

    // Create validation schemas
    for (const validation of defaultValidations) {
      const newValidation = new Validation({
        ...validation,
        createdDate: new Date()
      });
      await newValidation.save();
      console.log(`✅ Created/Updated validation schema: ${validation.name}`);
    }

    console.log('🎉 Validation schemas setup completed!');
  } catch (error) {
    console.error('❌ Error setting up validation schemas:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await setupValidationSchemas();
    console.log('✅ All validation schemas have been set up successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

// Run the script
main(); 