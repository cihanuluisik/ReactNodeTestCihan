const mongoose = require('mongoose');
const MeetingService = require('../../../services/MeetingService');
const Meeting = require('../../../model/schema/meeting');
const User = require('../../../model/schema/user');

describe('MeetingService Create Integration Tests', () => {
  let testUser;
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

  describe('createMeeting', () => {
    it('should handle empty string values for optional fields', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z',
        location: '',
        notes: '',
        createFor: ''
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe(meetingData.agenda);
      expect(result.meeting.dateTime).toBe(meetingData.dateTime);
    });

    it('should handle null values for optional fields', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z',
        location: null,
        notes: null,
        createFor: null
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe(meetingData.agenda);
      expect(result.meeting.dateTime).toBe(meetingData.dateTime);
    });

    it('should handle very long agenda text', async () => {
      const longAgenda = 'A'.repeat(1000); // 1000 character agenda
      const meetingData = {
        agenda: longAgenda,
        dateTime: '2024-01-15T10:00:00Z'
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe(longAgenda);
    });

    it('should handle different date formats', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        dateTime: '2024-12-31T23:59:59.999Z'
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting.dateTime).toBe(meetingData.dateTime);
    });

    it('should handle invalid userId', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z'
      };

      const result = await meetingService.createMeeting(meetingData, 'invalid-user-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create meeting');
    });
  });
}); 