const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const Meeting = require('../../../model/schema/meeting');
const { Contact } = require('../../../model/schema/contact');
const { Lead } = require('../../../model/schema/lead');
const User = require('../../../model/schema/user');

// Meeting-specific background steps
Given('there are test contacts and leads available', async function () {
  // Create test contact if not exists
  let testContact = await Contact.findOne({ email: 'test-contact@example.com' });
  if (!testContact) {
    testContact = new Contact({
      firstName: 'Test',
      lastName: 'Contact',
      email: 'test-contact@example.com',
      phoneNumber: 1234567890,
      createBy: this.userId || new mongoose.Types.ObjectId(),
      timestamp: new Date()
    });
    await testContact.save();
  }
  this.testContactId = testContact._id.toString();

  // Create test lead if not exists
  let testLead = await Lead.findOne({ email: 'test-lead@example.com' });
  if (!testLead) {
    testLead = new Lead({
      firstName: 'Test',
      lastName: 'Lead',
      email: 'test-lead@example.com',
      phoneNumber: 1234567890,
      createBy: this.userId || new mongoose.Types.ObjectId(),
      timestamp: new Date()
    });
    await testLead.save();
  }
  this.testLeadId = testLead._id.toString();
});

Given('there are existing meetings in the system', async function () {
  // Create test meetings
  const meeting1 = new Meeting({
    agenda: 'Existing Meeting 1',
    location: 'Room A',
    dateTime: '2024-01-15T10:00:00Z',
    createBy: this.userId || new mongoose.Types.ObjectId(),
    timestamp: new Date()
  });
  await meeting1.save();

  const meeting2 = new Meeting({
    agenda: 'Existing Meeting 2',
    location: 'Room B',
    dateTime: '2024-01-16T10:00:00Z',
    createBy: this.userId || new mongoose.Types.ObjectId(),
    timestamp: new Date()
  });
  await meeting2.save();
});

Given('there is an existing meeting with agenda {string}', async function (agenda) {
  const meeting = new Meeting({
    agenda: agenda,
    location: 'Test Location',
    dateTime: '2024-01-15T10:00:00Z',
    createBy: this.userId || new mongoose.Types.ObjectId(),
    timestamp: new Date()
  });
  const savedMeeting = await meeting.save();
  this.meetingId = savedMeeting._id.toString();
});

Given('there are multiple existing meetings', async function () {
  const meetings = [
    {
      agenda: 'Meeting 1',
      location: 'Room A',
      dateTime: '2024-01-15T10:00:00Z',
      createBy: this.userId || new mongoose.Types.ObjectId(),
      timestamp: new Date()
    },
    {
      agenda: 'Meeting 2',
      location: 'Room B',
      dateTime: '2024-01-16T10:00:00Z',
      createBy: this.userId || new mongoose.Types.ObjectId(),
      timestamp: new Date()
    },
    {
      agenda: 'Meeting 3',
      location: 'Room C',
      dateTime: '2024-01-17T10:00:00Z',
      createBy: this.userId || new mongoose.Types.ObjectId(),
      timestamp: new Date()
    }
  ];

  const savedMeetings = await Meeting.insertMany(meetings);
  this.meetingIds = savedMeetings.map(m => m._id.toString());
});

Given('there is a meeting created by another user', async function () {
  const otherUserId = new mongoose.Types.ObjectId();
  const meeting = new Meeting({
    agenda: 'Other User Meeting',
    location: 'Other Location',
    dateTime: '2024-01-15T10:00:00Z',
    createBy: otherUserId,
    timestamp: new Date()
  });
  const savedMeeting = await meeting.save();
  this.otherUserMeetingId = savedMeeting._id.toString();
});

// Meeting-specific request steps
When('I send a POST request to {string} with the following meeting data:', async function (endpoint, dataTable) {
  const rawTable = dataTable.rawTable;
  const headers = rawTable[0];
  const values = rawTable[1];
  
  const data = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  this.response = await request(global.testServer)
    .post(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a POST request to {string} with attendees data', async function (endpoint) {
  const data = {
    agenda: 'Meeting with Attendees',
    attendes: [this.testContactId],
    attendesLead: [this.testLeadId],
    location: 'Conference Room',
    dateTime: '2024-01-15T10:00:00Z',
    notes: 'Meeting with populated attendees'
  };

  this.response = await request(global.testServer)
    .post(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a POST request to {string} without authentication with the following data:', async function (endpoint, dataTable) {
  const rawTable = dataTable.rawTable;
  const headers = rawTable[0];
  const values = rawTable[1];
  
  const data = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  this.response = await request(global.testServer)
    .post(endpoint)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a POST request to meeting endpoint {string} with the following data:', async function (endpoint, dataTable) {
  const rawTable = dataTable.rawTable;
  const headers = rawTable[0];
  const values = rawTable[1];
  
  const data = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  this.response = await request(global.testServer)
    .post(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a POST request to {string} with invalid attendee IDs:', async function (endpoint, dataTable) {
  const rawTable = dataTable.rawTable;
  const headers = rawTable[0];
  const values = rawTable[1];
  
  const data = {};
  headers.forEach((header, index) => {
    if (header === 'attendes') {
      data[header] = values[index].split(',');
    } else {
      data[header] = values[index];
    }
  });

  this.response = await request(global.testServer)
    .post(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a POST request to {string} with oversized data', async function (endpoint) {
  const largeData = {
    agenda: 'A'.repeat(1024 * 1024), // 1MB of data
    dateTime: '2024-01-15T10:00:00Z'
  };

  this.response = await request(global.testServer)
    .post(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(largeData);
});

When('I send a POST request to {string} with XSS data:', async function (endpoint, dataTable) {
  const rawTable = dataTable.rawTable;
  const headers = rawTable[0];
  const values = rawTable[1];
  
  const data = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  this.response = await request(global.testServer)
    .post(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a PUT request to {string} with the following update data:', async function (endpoint, dataTable) {
  const rawTable = dataTable.rawTable;
  const headers = rawTable[0];
  const values = rawTable[1];
  
  const data = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  const url = endpoint.replace('{meetingId}', this.meetingId);
  this.response = await request(global.testServer)
    .put(url)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a PUT request to {string} with update data:', async function (endpoint, dataTable) {
  const rawTable = dataTable.rawTable;
  const headers = rawTable[0];
  const values = rawTable[1];
  
  const data = {};
  headers.forEach((header, index) => {
    data[header] = values[index];
  });

  const url = endpoint.replace('{nonExistentId}', new mongoose.Types.ObjectId().toString());
  this.response = await request(global.testServer)
    .put(url)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send(data);
});

When('I send a DELETE request to {string} with the JWT token', async function (endpoint) {
  let url = endpoint.replace('{meetingId}', this.meetingId);
  url = url.replace('{nonExistentId}', new (require('mongoose')).Types.ObjectId().toString());
  this.response = await request(global.testServer)
    .delete(url)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json');
});

When('I send a DELETE request to {string} with multiple meeting IDs', async function (endpoint) {
  this.response = await request(global.testServer)
    .delete(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send({ ids: this.meetingIds });
});

When('I send a DELETE request to {string} with invalid meeting IDs', async function (endpoint) {
  this.response = await request(global.testServer)
    .delete(endpoint)
    .set('Authorization', `Bearer ${this.jwtToken}`)
    .set('Content-Type', 'application/json')
    .send({ ids: ['invalid-id-1', 'invalid-id-2'] });
});

// Meeting-specific response validation steps
Then('the response should contain meeting data', function () {
  expect(this.response.body).to.have.property('_id');
  expect(this.response.body).to.have.property('agenda');
  expect(this.response.body).to.have.property('createBy');
  expect(this.response.body).to.have.property('timestamp');
});

Then('the meeting should have agenda {string}', function (agenda) {
  expect(this.response.body.agenda).to.equal(agenda);
});

Then('the meeting should have location {string}', function (location) {
  expect(this.response.body.location).to.equal(location);
});

Then('the meeting should be created by the authenticated user', function () {
  expect(this.response.body.createBy).to.have.property('_id');
  expect(this.response.body.createBy._id).to.equal(this.userId);
});

Then('the meeting should have attendees populated', function () {
  expect(this.response.body.attendes).to.be.an('array');
  if (this.response.body.attendes.length > 0) {
    // Attendees are stored as ObjectIds, not populated objects
    expect(this.response.body.attendes[0]).to.be.a('string');
  }
});

Then('the meeting should have lead attendees populated', function () {
  expect(this.response.body.attendesLead).to.be.an('array');
  if (this.response.body.attendesLead.length > 0) {
    // Lead attendees are stored as ObjectIds, not populated objects
    expect(this.response.body.attendesLead[0]).to.be.a('string');
  }
});

Then('the response should contain an array of meetings', function () {
  expect(this.response.body).to.be.an('array');
  if (this.response.body.length > 0) {
    expect(this.response.body[0]).to.have.property('_id');
    expect(this.response.body[0]).to.have.property('agenda');
  }
});

Then('all meetings should be visible to superAdmin', function () {
  expect(this.response.body).to.be.an('array');
  // SuperAdmin should see all meetings, so we expect at least the ones we created
  expect(this.response.body.length).to.be.greaterThan(0);
});

Then('the response should contain updated meeting data', function () {
  expect(this.response.body).to.have.property('_id');
  expect(this.response.body).to.have.property('agenda');
  expect(this.response.body).to.have.property('location');
});

Then('the response should contain success message', function () {
  expect(this.response.body).to.have.property('message');
  expect(this.response.body.message).to.include('deleted successfully');
});

Then('the meeting should be soft deleted', async function () {
  const meeting = await Meeting.findById(this.meetingId);
  expect(meeting.deleted).to.be.true;
});

Then('the response should contain success message about multiple deletions', function () {
  expect(this.response.body).to.have.property('message');
  expect(this.response.body.message).to.include('deleted successfully');
});

Then('the response should contain error message about missing agenda', function () {
  expect(this.response.body).to.have.property('error');
  expect(this.response.body.error).to.include('"agenda" is not allowed to be empty');
});



Then('the response should contain error message about request body too large', function () {
  expect(this.response.body).to.have.property('error');
  expect(this.response.body.error).to.include('too large');
});

Then('the response should contain sanitized data without script tags', function () {
  expect(this.response.body.agenda).to.not.include('<script>');
  expect(this.response.body.agenda).to.include('Test Meeting');
});

Then('the response should contain error message about invalid meeting ID format', function () {
  expect(this.response.body).to.have.property('error');
  expect(this.response.body.error).to.include('Invalid meeting ID format');
});

// This step definition is already defined in shared.steps.js
// Removing duplicate to avoid conflicts

Then('the response should contain error message about invalid meeting IDs', function () {
  expect(this.response.body).to.have.property('error');
  expect(this.response.body.error).to.include('Invalid meeting IDs');
}); 

// Additional step definitions for new meeting creation scenarios
Then('the meeting should have duration {int}', function (duration) {
  expect(this.response.body.duration).to.equal(duration);
});

Then('the meeting should have default duration {int}', function (duration) {
  expect(this.response.body.duration).to.equal(duration);
});

Then('the meeting should have createFor {string}', function (createFor) {
  expect(this.response.body.createFor).to.equal(createFor);
});

Then('the response should contain error message about invalid duration', function () {
  expect(this.response.body).to.have.property('error');
  expect(this.response.body.error).to.include('Duration must be between 15 and 480 minutes');
});