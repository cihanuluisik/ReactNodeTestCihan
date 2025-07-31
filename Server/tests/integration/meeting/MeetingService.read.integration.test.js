const mongoose = require('mongoose');
const MeetingService = require('../../../services/MeetingService');
const Meeting = require('../../../model/schema/meeting');
const User = require('../../../model/schema/user');

describe('MeetingService Read Integration Tests', () => {
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

  describe('getAllMeetings', () => {
    beforeEach(async () => {
      // Create test meetings with different timestamps
      const meeting1 = new Meeting({
        agenda: 'Meeting 1',
        location: 'Room A',
        dateTime: '2024-01-15T10:00:00Z',
        createBy: testUser._id,
        timestamp: new Date('2024-01-15T10:00:00Z')
      });
      await meeting1.save();

      const meeting2 = new Meeting({
        agenda: 'Meeting 2',
        location: 'Room B',
        dateTime: '2024-01-16T10:00:00Z',
        createBy: testUser._id,
        timestamp: new Date('2024-01-16T10:00:00Z')
      });
      await meeting2.save();
    });

    it('should handle different user roles correctly', async () => {
      // Create another user
      const otherUser = new User({
        username: 'other@example.com',
        password: 'testpassword123',
        firstName: 'Other',
        lastName: 'User',
        phoneNumber: 1234567891,
        createdDate: new Date()
      });
      await otherUser.save();

      // Create meeting for other user
      const otherMeeting = new Meeting({
        agenda: 'Other User Meeting',
        location: 'Room C',
        dateTime: '2024-01-17T10:00:00Z',
        createBy: otherUser._id,
        timestamp: new Date('2024-01-17T10:00:00Z')
      });
      await otherMeeting.save();

      // Test superAdmin can see all meetings
      const superAdminResult = await meetingService.getAllMeetings(testUser._id.toString(), 'superAdmin');
      expect(superAdminResult.success).toBe(true);
      expect(superAdminResult.meetings).toHaveLength(3);

      // Test regular user can only see their own meetings
      const userResult = await meetingService.getAllMeetings(testUser._id.toString(), 'user');
      expect(userResult.success).toBe(true);
      expect(userResult.meetings).toHaveLength(2);

      // Clean up
      await User.deleteOne({ _id: otherUser._id });
    });
  });

  describe('getMeetingById', () => {
    beforeEach(async () => {
      testMeeting = new Meeting({
        agenda: 'Test Meeting',
        location: 'Test Room',
        dateTime: '2024-01-15T10:00:00Z',
        createBy: testUser._id,
        timestamp: new Date()
      });
      await testMeeting.save();
    });

    it('should handle null meeting ID', async () => {
      const result = await meetingService.getMeetingById(
        null,
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Meeting not found');
    });

    it('should return meeting with all fields populated', async () => {
      const fullMeeting = new Meeting({
        agenda: 'Full Meeting',
        location: 'Conference Room',
        dateTime: '2024-01-15T10:00:00Z',
        duration: 90,
        createFor: 'Project Review',
        notes: 'Important meeting notes',
        related: 'Contact',
        attendes: [],
        attendesLead: [],
        createBy: testUser._id,
        timestamp: new Date()
      });
      await fullMeeting.save();

      const result = await meetingService.getMeetingById(
        fullMeeting._id.toString(),
        testUser._id.toString(),
        'superAdmin'
      );

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe('Full Meeting');
      expect(result.meeting.location).toBe('Conference Room');
      expect(result.meeting.duration).toBe(90);
      expect(result.meeting.createFor).toBe('Project Review');
      expect(result.meeting.notes).toBe('Important meeting notes');
      expect(result.meeting.related).toBe('Contact');
      expect(result.meeting.createBy._id.toString()).toBe(testUser._id.toString());
    });
  });
}); 