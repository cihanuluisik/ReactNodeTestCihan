const Meeting = require('../model/schema/meeting');

/**
 * MeetingRepository - Handles database operations for meetings
 * Following Single Responsibility Principle - each method has one clear purpose
 */
class MeetingRepository {
  /**
   * Find all meetings with role-based filtering
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Array} - Array of meetings
   */
  async findAll(userId, userRole) {
    const query = { deleted: false };
    
    if (userRole !== 'superAdmin') {
      query.createBy = userId;
    }

    return await Meeting.find(query)
      .populate('createBy', 'firstName lastName username')
      .sort({ timestamp: -1 });
  }

  /**
   * Find meeting by ID with role-based access control
   * @param {string} meetingId - Meeting ID
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Meeting object
   */
  async findById(meetingId, userId, userRole) {
    const query = { _id: meetingId, deleted: false };
    
    if (userRole !== 'superAdmin') {
      query.createBy = userId;
    }

    return await Meeting.findOne(query)
      .populate('createBy', 'firstName lastName username');
  }

  /**
   * Create new meeting
   * @param {Object} meetingData - Meeting data
   * @param {string} userId - User ID creating the meeting
   * @returns {Object} - Created meeting
   */
  async create(meetingData, userId) {
    const meeting = new Meeting({
      ...meetingData,
      createBy: userId,
      timestamp: new Date()
    });

    return await meeting.save();
  }

  /**
   * Update meeting with role-based access control
   * @param {string} meetingId - Meeting ID
   * @param {Object} updateData - Update data
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Updated meeting
   */
  async update(meetingId, updateData, userId, userRole) {
    const query = { _id: meetingId, deleted: false };
    
    if (userRole !== 'superAdmin') {
      query.createBy = userId;
    }

    return await Meeting.findOneAndUpdate(
      query,
      { ...updateData, updatedDate: new Date() },
      { new: true }
    );
  }

  /**
   * Delete meeting (soft delete) with role-based access control
   * @param {string} meetingId - Meeting ID
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Deleted meeting
   */
  async delete(meetingId, userId, userRole) {
    const query = { _id: meetingId, deleted: false };
    
    if (userRole !== 'superAdmin') {
      query.createBy = userId;
    }

    return await Meeting.findOneAndUpdate(
      query,
      { deleted: true, updatedDate: new Date() },
      { new: true }
    );
  }

  /**
   * Delete multiple meetings (soft delete) with role-based access control
   * @param {Array} meetingIds - Array of meeting IDs
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Update result
   */
  async deleteMany(meetingIds, userId, userRole) {
    const query = { _id: { $in: meetingIds }, deleted: false };
    
    if (userRole !== 'superAdmin') {
      query.createBy = userId;
    }

    return await Meeting.updateMany(
      query,
      { deleted: true, updatedDate: new Date() }
    );
  }
}

module.exports = MeetingRepository; 