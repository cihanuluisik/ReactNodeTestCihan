const MeetingRepository = require('../repository/MeetingRepository');

class MeetingService {
  constructor() {
    this.meetingRepository = new MeetingRepository();
  }
  /**
   * Get all meetings with role-based filtering
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Array} - Array of meetings
   */
  async getAllMeetings(userId, userRole) {
    try {
      const meetings = await this.meetingRepository.findAll(userId, userRole);
      return { success: true, meetings };
    } catch (error) {
      console.error('Get all meetings error:', error);
      return { success: false, error: 'Failed to get meetings' };
    }
  }

  /**
   * Get a single meeting by ID with role-based access control
   * @param {string} meetingId - Meeting ID
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Meeting object
   */
  async getMeetingById(meetingId, userId, userRole) {
    try {
      const meeting = await this.meetingRepository.findById(meetingId, userId, userRole);

      if (!meeting) {
        return { success: false, error: 'Meeting not found' };
      }

      return { success: true, meeting };
    } catch (error) {
      console.error('Get meeting by ID error:', error);
      return { success: false, error: 'Failed to get meeting' };
    }
  }

  /**
   * Create a new meeting
   * @param {Object} meetingData - Meeting data
   * @param {string} userId - User ID creating the meeting
   * @returns {Object} - Created meeting
   */
  async createMeeting(meetingData, userId) {
    try {
      const savedMeeting = await this.meetingRepository.create(meetingData, userId);
      
      // Populate createBy field for response
      const populatedMeeting = await this.meetingRepository.findById(savedMeeting._id, userId, 'superAdmin');

      return { success: true, meeting: populatedMeeting };
    } catch (error) {
      console.error('Create meeting error:', error);
      return { success: false, error: 'Failed to create meeting' };
    }
  }

  /**
   * Update an existing meeting
   * @param {string} meetingId - Meeting ID
   * @param {Object} updateData - Update data
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Updated meeting
   */
  async updateMeeting(meetingId, updateData, userId, userRole) {
    try {
      const meeting = await this.meetingRepository.update(meetingId, updateData, userId, userRole);

      if (!meeting) {
        return { success: false, error: 'Meeting not found or access denied' };
      }

      return { success: true, meeting };
    } catch (error) {
      console.error('Update meeting error:', error);
      return { success: false, error: 'Failed to update meeting' };
    }
  }

  /**
   * Delete a meeting (soft delete)
   * @param {string} meetingId - Meeting ID
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Success status
   */
  async deleteMeeting(meetingId, userId, userRole) {
    try {
      const meeting = await this.meetingRepository.delete(meetingId, userId, userRole);

      if (!meeting) {
        return { success: false, error: 'Meeting not found or access denied' };
      }

      return { success: true, message: 'Meeting deleted successfully' };
    } catch (error) {
      console.error('Delete meeting error:', error);
      return { success: false, error: 'Failed to delete meeting' };
    }
  }

  /**
   * Delete multiple meetings (soft delete)
   * @param {Array} meetingIds - Array of meeting IDs
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Success status
   */
  async deleteMultipleMeetings(meetingIds, userId, userRole) {
    try {
      const result = await this.meetingRepository.deleteMany(meetingIds, userId, userRole);

      if (result.modifiedCount === 0) {
        return { success: false, error: 'No meetings found or access denied' };
      }

      return { 
        success: true, 
        message: `${result.modifiedCount} meeting(s) deleted successfully` 
      };
    } catch (error) {
      console.error('Delete multiple meetings error:', error);
      return { success: false, error: 'Failed to delete meetings' };
    }
  }
}

module.exports = MeetingService; 