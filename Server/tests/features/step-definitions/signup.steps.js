const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const request = require('supertest');

let registeredUsers = new Map();

// Signup-specific steps
Given('I have registered a new user with email {string}', async function (email) {
  // For E2E tests, actually create a user in the database
  // Use the exact email provided for duplicate testing
  const userData = {
    username: email,
    password: 'password123',
    firstName: 'Flow',
    lastName: 'Test',
    phoneNumber: '1234567890'
  };

  const registerResponse = await request(global.testServer)
    .post('/api/user/register')
    .set('Content-Type', 'application/json')
    .send(userData);

  expect(registerResponse.status).to.equal(200);
  
  // Store the email for later use in the same scenario
  this.registeredEmail = email;
});

Given('I have registered a new admin with email {string}', async function (email) {
  // For E2E tests, actually create an admin in the database
  // Use the exact email provided for duplicate testing
  const adminData = {
    username: email,
    password: 'adminpassword123',
    firstName: 'Admin',
    lastName: 'User',
    phoneNumber: '1234567890',
    role: 'superAdmin'
  };

  const registerResponse = await request(global.testServer)
    .post('/api/user/admin-register')
    .set('Content-Type', 'application/json')
    .send(adminData);

  // Admin registration should succeed (200) or fail if admin already exists (400)
  // Both are acceptable outcomes for the test setup
  expect([200, 400]).to.include(registerResponse.status);
  
  // Store the email for later use in the same scenario
  this.registeredEmail = email;
});

When('I login with the registered user credentials', async function () {
  const loginData = {
    username: this.registeredEmail,
    password: 'password123'
  };

  this.response = await request(global.testServer)
    .post('/api/user/login')
    .set('Content-Type', 'application/json')
    .send(loginData);
});

When('I login with the registered admin credentials', async function () {
  const loginData = {
    username: this.registeredEmail,
    password: 'adminpassword123'
  };

  this.response = await request(global.testServer)
    .post('/api/user/login')
    .set('Content-Type', 'application/json')
    .send(loginData);
}); 