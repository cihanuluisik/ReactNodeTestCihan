const jwt = require('jsonwebtoken');
const { config } = require('../../config/environment');
const User = require('../../model/schema/user');
const Meeting = require('../../model/schema/meeting');

/**
 * Create a test user with authentication token
 * @returns {Object} Test user object with userId and token
 */
const createTestUser = async () => {
  const testUserData = {
    username: `testuser_${Date.now()}@example.com`,
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: 1234567890
  };

  // Create user
  const user = new User(testUserData);
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user._id,
      username: user.username,
      roles: [{ name: 'user' }]
    },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  return {
    userId: user._id,
    token,
    user
  };
};

/**
 * Create a test super admin user with authentication token
 * @returns {Object} Test super admin object with userId and token
 */
const createTestSuperAdmin = async () => {
  const testAdminData = {
    username: `testadmin_${Date.now()}@example.com`,
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'Admin',
    phoneNumber: 1234567890
  };

  // Create user
  const user = new User(testAdminData);
  await user.save();

  // Generate JWT token with superAdmin role
  const token = jwt.sign(
    { 
      userId: user._id,
      username: user.username,
      roles: [{ name: 'superAdmin' }]
    },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  return {
    userId: user._id,
    token,
    user
  };
};

/**
 * Create a test meeting
 * @param {string} userId - User ID creating the meeting
 * @param {Object} meetingData - Optional meeting data to override defaults
 * @returns {Object} Created meeting object
 */
const createTestMeeting = async (userId, meetingData = {}) => {
  const defaultMeetingData = {
    title: `Test Meeting ${Date.now()}`,
    agenda: 'Test meeting agenda',
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 30,
    location: 'Test Location',
    attendes: [],
    attendesLead: [],
    createBy: userId,
    timestamp: new Date()
  };

  const finalMeetingData = { ...defaultMeetingData, ...meetingData };
  
  const meeting = new Meeting(finalMeetingData);
  return await meeting.save();
};

/**
 * Create multiple test meetings
 * @param {string} userId - User ID creating the meetings
 * @param {number} count - Number of meetings to create
 * @returns {Array} Array of created meeting objects
 */
const createMultipleTestMeetings = async (userId, count = 3) => {
  const meetings = [];
  
  for (let i = 0; i < count; i++) {
    const meetingData = {
      title: `Test Meeting ${i + 1} ${Date.now()}`,
      agenda: `Test meeting agenda ${i + 1}`,
      dateTime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Different days
      duration: 30 + (i * 15), // Different durations
      location: `Test Location ${i + 1}`
    };
    
    const meeting = await createTestMeeting(userId, meetingData);
    meetings.push(meeting);
  }
  
  return meetings;
};

/**
 * Clean up test data
 * @param {Array} userIds - Array of user IDs to delete
 * @param {Array} meetingIds - Array of meeting IDs to delete
 */
const cleanupTestData = async (userIds = [], meetingIds = []) => {
  if (userIds.length > 0) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  
  if (meetingIds.length > 0) {
    await Meeting.deleteMany({ _id: { $in: meetingIds } });
  }
};

module.exports = {
  createTestUser,
  createTestSuperAdmin,
  createTestMeeting,
  createMultipleTestMeetings,
  cleanupTestData
}; 