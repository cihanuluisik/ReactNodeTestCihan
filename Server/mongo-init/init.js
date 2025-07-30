// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the Prolink database
db = db.getSiblingDB('Prolink');

// Create a user for the application
db.createUser({
  user: 'prolink_user',
  pwd: 'prolink123',
  roles: [
    {
      role: 'readWrite',
      db: 'Prolink'
    }
  ]
});

// Create initial collections
db.createCollection('User');
db.createCollection('Contact');
db.createCollection('Lead');
db.createCollection('Property');
db.createCollection('Account');
db.createCollection('Invoice');
db.createCollection('Quote');
db.createCollection('Task');
db.createCollection('Meeting');
db.createCollection('Email');
db.createCollection('Document');
db.createCollection('CustomField');
db.createCollection('RoleAccess');

print('MongoDB initialization completed successfully!');
print('Database: Prolink');
print('User: prolink_user');
print('Collections created successfully.'); 