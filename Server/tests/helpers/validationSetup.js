const mongoose = require('mongoose');
const Validation = require('../../model/schema/validation');
const { Contact, initializeContactSchema } = require('../../model/schema/contact');
const { Lead, initializeLeadSchema } = require('../../model/schema/lead');
const CustomField = require('../../model/schema/customField');
const { contactFields } = require('../../db/contactFields');
const { leadFields } = require('../../db/leadFields');

// Default validation schemas for tests
const defaultValidations = [
  {
    name: 'auth-login',
    validations: [
      {
        formikType: 'username',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Username must be a valid email address',
        match: false
      },
      {
        formikType: 'password',
        require: true,
        min: true, // 6 characters minimum
        max: false,
        value: null,
        message: 'Password must be at least 6 characters long',
        match: false
      }
    ]
  },
  {
    name: 'auth-register',
    validations: [
      {
        formikType: 'username',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Username must be a valid email address',
        match: false
      },
      {
        formikType: 'password',
        require: true,
        min: true, // 6 characters minimum
        max: false,
        value: null,
        message: 'Password must be at least 6 characters long',
        match: false
      },
      {
        formikType: 'firstName',
        require: true,
        min: true, // 2 characters minimum
        max: false,
        value: null,
        message: 'First name must be at least 2 characters long',
        match: false
      },
      {
        formikType: 'lastName',
        require: true,
        min: true, // 2 characters minimum
        max: false,
        value: null,
        message: 'Last name must be at least 2 characters long',
        match: false
      },
      {
        formikType: 'phoneNumber',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Phone number must be valid',
        match: false
      }
    ]
  },
  {
    name: 'auth-admin-register',
    validations: [
      {
        formikType: 'username',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Username must be a valid email address',
        match: false
      },
      {
        formikType: 'password',
        require: true,
        min: true, // 6 characters minimum
        max: false,
        value: null,
        message: 'Password must be at least 6 characters long',
        match: false
      },
      {
        formikType: 'firstName',
        require: true,
        min: true, // 2 characters minimum
        max: false,
        value: null,
        message: 'First name must be at least 2 characters long',
        match: false
      },
      {
        formikType: 'lastName',
        require: true,
        min: true, // 2 characters minimum
        max: false,
        value: null,
        message: 'Last name must be at least 2 characters long',
        match: false
      },
      {
        formikType: 'phoneNumber',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Phone number must be valid',
        match: false
      },
      {
        formikType: 'role',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Role must be valid',
        match: false
      }
    ]
  },
  {
    name: 'validate-email',
    validations: [
      {
        formikType: 'email',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Email must be valid',
        match: false
      }
    ]
  },
  {
    name: 'validate-password',
    validations: [
      {
        formikType: 'password',
        require: true,
        min: true, // 6 characters minimum
        max: false,
        value: null,
        message: 'Password must be at least 6 characters long',
        match: false
      }
    ]
  },
  {
    name: 'validate-password-strength',
    validations: [
      {
        formikType: 'password',
        require: true,
        min: true, // 6 characters minimum
        max: false,
        value: null,
        message: 'Password must be at least 6 characters long',
        match: false
      }
    ]
  },
  {
    name: 'validate-token',
    validations: [
      {
        formikType: 'token',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Token must be valid',
        match: false
      }
    ]
  },
  {
    name: 'validate-role',
    validations: [
      {
        formikType: 'role',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Role must be valid',
        match: false
      }
    ]
  },
  {
    name: 'validate-phone',
    validations: [
      {
        formikType: 'phoneNumber',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Phone number must be valid',
        match: false
      }
    ]
  },
  {
    name: 'meeting',
    validations: [
      {
        formikType: 'agenda',
        require: true,
        min: 1, // 1 character minimum
        max: false,
        value: null,
        message: 'Agenda is required',
        match: false
      },
      {
        formikType: 'dateTime',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Date and time is required',
        match: false
      },
      {
        formikType: 'duration',
        require: false,
        min: 15,
        max: 480,
        value: null,
        message: 'Duration must be between 15 and 480 minutes',
        match: false
      },
      {
        formikType: 'location',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Location is optional',
        match: false
      },
      {
        formikType: 'notes',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Notes are optional',
        match: false
      },
      {
        formikType: 'attendes',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Attendees are optional',
        match: false
      },
      {
        formikType: 'attendesLead',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Lead attendees are optional',
        match: false
      },
      {
        formikType: 'createFor',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Create For is optional',
        match: false
      },
      {
        formikType: 'related',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Related is optional',
        match: false
      },
      {
        formikType: 'createBy',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Create By is optional',
        match: false
      }
    ]
  },
  {
    name: 'meetingUpdate',
    validations: [
      {
        formikType: 'agenda',
        require: false,
        min: true, // 1 character minimum if provided
        max: false,
        value: null,
        message: 'Agenda must be at least 1 character if provided',
        match: false
      },
      {
        formikType: 'dateTime',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Date and time is optional for updates',
        match: false
      },
      {
        formikType: 'duration',
        require: false,
        min: true,
        max: true,
        value: { min: 15, max: 480 },
        message: 'Duration must be between 15 and 480 minutes if provided',
        match: false
      },
      {
        formikType: 'location',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Location is optional',
        match: false
      },
      {
        formikType: 'notes',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Notes are optional',
        match: false
      },
      {
        formikType: 'attendes',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Attendees are optional',
        match: false
      },
      {
        formikType: 'attendesLead',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Lead attendees are optional',
        match: false
      },
      {
        formikType: 'createFor',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Create For is optional',
        match: false
      },
      {
        formikType: 'related',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Related is optional',
        match: false
      },
      {
        formikType: 'createBy',
        require: false,
        min: false,
        max: false,
        value: null,
        message: 'Create By is optional for updates',
        match: false
      }
    ]
  }
];

// Setup validation schemas
const setupValidationSchemas = async () => {
  try {
    console.log('🚀 Setting up validation schemas...');

    // Wait for database connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for database connection...');
      await new Promise((resolve) => {
        const checkConnection = () => {
          if (mongoose.connection.readyState === 1) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    // Setup CustomField data for Contact and Lead schemas
    await setupCustomFields();

    // Initialize Contact and Lead schemas
    await initializeContactSchema();
    await initializeLeadSchema();

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

// Setup CustomField data for Contact and Lead schemas
const setupCustomFields = async () => {
  try {
    // Clear existing CustomField data
    await CustomField.deleteMany({});

    // Create Contact fields
    const contactCustomField = new CustomField({
      moduleName: 'Contacts',
      fields: contactFields,
      headings: [],
      isDefault: true,
      createdDate: new Date()
    });
    await contactCustomField.save();

    // Create Lead fields
    const leadCustomField = new CustomField({
      moduleName: 'Leads',
      fields: leadFields,
      headings: [],
      isDefault: true,
      createdDate: new Date()
    });
    await leadCustomField.save();

    console.log('✅ CustomField data setup completed');
  } catch (error) {
    console.error('❌ Error setting up CustomField data:', error);
    throw error;
  }
};

// Clear validation schemas (useful for cleanup)
const clearValidationSchemas = async () => {
  try {
    const schemaNames = defaultValidations.map(v => v.name);
    await Validation.deleteMany({ name: { $in: schemaNames } });
    console.log('🧹 Validation schemas cleared');
  } catch (error) {
    console.error('❌ Error clearing validation schemas:', error);
    throw error;
  }
};

module.exports = {
  setupValidationSchemas,
  clearValidationSchemas,
  defaultValidations
}; 