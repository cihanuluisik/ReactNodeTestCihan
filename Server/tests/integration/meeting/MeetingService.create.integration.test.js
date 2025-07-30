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
    it('should successfully create a meeting with all fields', async () => {
      const meetingData = {
        agenda: 'Test Meeting Agenda',
        location: 'Conference Room A',
        related: 'Project Discussion',
        dateTime: '2024-01-15T10:00:00Z',
        notes: 'Important meeting notes',
        duration: 60,
        createFor: 'Client Presentation'
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting).toBeDefined();
      expect(result.meeting.agenda).toBe(meetingData.agenda);
      expect(result.meeting.location).toBe(meetingData.location);
      expect(result.meeting.related).toBe(meetingData.related);
      expect(result.meeting.dateTime).toBe(meetingData.dateTime);
      expect(result.meeting.notes).toBe(meetingData.notes);
      expect(result.meeting.duration).toBe(meetingData.duration);
      expect(result.meeting.createFor).toBe(meetingData.createFor);
      expect(result.meeting.createBy._id.toString()).toBe(testUser._id.toString());
    });

    it('should successfully create a meeting with minimal required fields', async () => {
      const meetingData = {
        agenda: 'Minimal Meeting',
        dateTime: '2024-01-15T10:00:00Z'
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting).toBeDefined();
      expect(result.meeting.agenda).toBe(meetingData.agenda);
      expect(result.meeting.dateTime).toBe(meetingData.dateTime);
      expect(result.meeting.duration).toBe(30); // Default duration
      expect(result.meeting.createBy._id.toString()).toBe(testUser._id.toString());
    });

    it('should handle missing required agenda field', async () => {
      const meetingData = {
        location: 'Conference Room A',
        dateTime: '2024-01-15T10:00:00Z'
        // Missing agenda (required field)
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create meeting');
    });

    it('should handle missing required dateTime field', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        location: 'Conference Room A'
        // Missing dateTime (required field)
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create meeting');
    });

    it('should handle invalid duration values', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z',
        duration: 10 // Below minimum (15 minutes)
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create meeting');
    });

    it('should handle duration above maximum', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z',
        duration: 500 // Above maximum (480 minutes)
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create meeting');
    });

    it('should create meeting with valid duration range', async () => {
      const meetingData = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z',
        duration: 120 // Valid duration (2 hours)
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting.duration).toBe(120);
    });

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

    it('should handle special characters in agenda', async () => {
      const meetingData = {
        agenda: 'Test Meeting with special chars: @#$%^&*()_+-=[]{}|;:,.<>?',
        dateTime: '2024-01-15T10:00:00Z'
      };

      const result = await meetingService.createMeeting(meetingData, testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.meeting.agenda).toBe(meetingData.agenda);
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