const { Given } = require('@cucumber/cucumber');
const { expect } = require('chai');
const request = require('supertest');

// Signin-specific steps
Given('there is an existing admin user with email {string} and password {string}', async function (email, password) {
  // This is handled by the test database setup
  // The admin user is already seeded in the test database
});

Given('I have logged in successfully with email {string} and password {string}', async function (email, password) {
  const loginResponse = await request(global.testServer)
    .post('/api/user/login')
    .set('Content-Type', 'application/json')
    .send({
      username: email,
      password: password
    });

  expect(loginResponse.status).to.equal(200);
  expect(loginResponse.body).to.have.property('token');
  
  this.jwtToken = loginResponse.body.token;
  this.userId = loginResponse.body.user._id;
}); 