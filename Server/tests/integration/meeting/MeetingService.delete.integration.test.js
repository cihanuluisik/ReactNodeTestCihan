const mongoose = require('mongoose');
const MeetingService = require('../../../services/MeetingService');
const Meeting = require('../../../model/schema/meeting');
const User = require('../../../model/schema/user');

describe('MeetingService Delete Integration Tests', () => {
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

  describe('deleteMeeting', () => {
    beforeEach(async () => {
      testMeeting = new Meeting({
        agenda: 'Meeting to Delete',
        location: 'Test Room',
        dateTime: '2024-01-15T10:00:00Z',
        createBy: testUser._id,
        timestamp: new Date()
      });
      await testMeeting.save();
    });

    it('should handle null meeting ID', async () => {
      const result = await meetingService.deleteMeeting(
        null,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Meeting not found or access denied');
    });

    it('should not delete already deleted meeting', async () => {
      // First delete the meeting
      await meetingService.deleteMeeting(
        testMeeting._id.toString(),
        testUser._id.toString(),
        'superAdmin'
      );

      // Try to delete it again
      const result = await meetingService.deleteMeeting(
        testMeeting._id.toString(),
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Meeting not found or access denied');
    });
  });

  describe('deleteMultipleMeetings', () => {
    let meeting1, meeting2;

    beforeEach(async () => {
      meeting1 = new Meeting({
        agenda: 'Meeting 1',
        location: 'Room A',
        dateTime: '2024-01-15T10:00:00Z',
        createBy: testUser._id,
        timestamp: new Date()
      });
      await meeting1.save();

      meeting2 = new Meeting({
        agenda: 'Meeting 2',
        location: 'Room B',
        dateTime: '2024-01-16T10:00:00Z',
        createBy: testUser._id,
        timestamp: new Date()
      });
      await meeting2.save();
    });

    it('should handle empty meeting IDs array', async () => {
      const result = await meetingService.deleteMultipleMeetings(
        [],
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('No meetings found or access denied');
    });

    it('should handle mixed valid and invalid meeting IDs', async () => {
      const meetingIds = [meeting1._id.toString(), 'invalid-id'];
      const result = await meetingService.deleteMultipleMeetings(
        meetingIds,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete meetings');
    });

    it('should handle null meeting IDs array', async () => {
      const result = await meetingService.deleteMultipleMeetings(
        null,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('No meetings found or access denied');
    });

    it('should handle single meeting deletion', async () => {
      const meetingIds = [meeting1._id.toString()];
      const result = await meetingService.deleteMultipleMeetings(
        meetingIds,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('1 meeting(s) deleted successfully');
    });
  });
}); 