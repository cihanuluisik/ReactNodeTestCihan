const mongoose = require('mongoose');
const MeetingService = require('../../../services/MeetingService');
const Meeting = require('../../../model/schema/meeting');
const User = require('../../../model/schema/user');

describe('MeetingService Update Integration Tests', () => {
  let testUser;
  let testMeeting;
  let meetingService;

  beforeAll(async () => {
    // Create test user data
    const userData = {
      username: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: 1234567890
    };

    // Create test user
    testUser = new User({
      ...userData,
      createdDate: new Date()
    });
    await testUser.save();

    // Instantiate MeetingService
    meetingService = new MeetingService();
  });

  beforeEach(async () => {
    // Clear meetings before each test
    await Meeting.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Meeting.deleteMany({});
  });

  describe('updateMeeting', () => {
    beforeEach(async () => {
      testMeeting = new Meeting({
        agenda: 'Original Agenda',
        location: 'Original Location',
        dateTime: '2024-01-15T10:00:00Z',
        createBy: testUser._id,
        timestamp: new Date()
      });
      await testMeeting.save();
    });

    it('should update all fields when provided', async () => {
      const updateData = {
        agenda: 'Updated Agenda',
        location: 'Updated Location',
        dateTime: '2024-01-16T10:00:00Z',
        duration: 120,
        createFor: 'Updated Purpose',
        notes: 'Updated notes',
        related: 'Updated Related'
      };

      const result = await meetingService.updateMeeting(
        testMeeting._id.toString(),
        updateData,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe('Updated Agenda');
      expect(result.meeting.location).toBe('Updated Location');
      expect(result.meeting.dateTime).toBe('2024-01-16T10:00:00Z');
      expect(result.meeting.duration).toBe(120);
      expect(result.meeting.createFor).toBe('Updated Purpose');
      expect(result.meeting.notes).toBe('Updated notes');
      expect(result.meeting.related).toBe('Updated Related');
    });

    it('should handle partial updates', async () => {
      const updateData = {
        agenda: 'Partially Updated Agenda'
      };

      const result = await meetingService.updateMeeting(
        testMeeting._id.toString(),
        updateData,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe('Partially Updated Agenda');
      expect(result.meeting.location).toBe('Original Location'); // Should remain unchanged
    });

    it('should handle empty update data', async () => {
      const updateData = {};

      const result = await meetingService.updateMeeting(
        testMeeting._id.toString(),
        updateData,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe('Original Agenda'); // Should remain unchanged
    });

    it('should handle null update data', async () => {
      const result = await meetingService.updateMeeting(
        testMeeting._id.toString(),
        null,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(true);
      expect(result.meeting).toBeDefined();
    });
  });
}); 