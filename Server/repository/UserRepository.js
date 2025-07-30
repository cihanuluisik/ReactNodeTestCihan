const User = require('../model/schema/user');

/**
 * UserRepository - Handles database operations for users
 * Following Single Responsibility Principle - each method has one clear purpose
 */
class UserRepository {
  /**
   * Find user by username (email) for authentication
   * @param {string} username - User's email/username
   * @returns {Object} - User object with populated roles
   */
  async findByUsername(username) {
    return await User.findOne({ username, deleted: false }).populate({
      path: 'roles'
    });
  }

  /**
   * Find user by ID with role-based access control
   * @param {string} userId - User ID
   * @param {string} currentUserId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - User object
   */
  async findById(userId, currentUserId, userRole) {
    const query = { _id: userId, deleted: false };
    
    if (userRole !== 'superAdmin') {
      query._id = currentUserId; // Users can only access their own data
    }

    return await User.findOne(query).populate('roles');
  }

  /**
   * Find all users with role-based filtering
   * @param {string} currentUserId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Array} - Array of users
   */
  async findAll(currentUserId, userRole) {
    const query = { deleted: false };
    
    if (userRole !== 'superAdmin') {
      query._id = currentUserId; // Users can only see their own data
    }

    return await User.find(query)
      .populate('roles')
      .sort({ timestamp: -1 });
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} createdBy - User ID creating the account
   * @returns {Object} - Created user
   */
  async create(userData, createdBy) {
    const user = new User({
      ...userData,
      createBy: createdBy,
      timestamp: new Date()
    });

    return await user.save();
  }

  /**
   * Update user with role-based access control
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @param {string} currentUserId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Updated user
   */
  async update(userId, updateData, currentUserId, userRole) {
    const query = { _id: userId, deleted: false };
    
    if (userRole !== 'superAdmin') {
      query._id = currentUserId; // Users can only update their own data
    }

    return await User.findOneAndUpdate(
      query,
      { ...updateData, updatedDate: new Date() },
      { new: true }
    ).populate('roles');
  }

  /**
   * Delete user (soft delete) with role-based access control
   * @param {string} userId - User ID
   * @param {string} currentUserId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Object} - Deleted user
   */
  async delete(userId, currentUserId, userRole) {
    const query = { _id: userId, deleted: false };
    
    if (userRole !== 'superAdmin') {
      query._id = currentUserId; // Users can only delete their own account
    }

    return await User.findOneAndUpdate(
      query,
      { deleted: true, updatedDate: new Date() },
      { new: true }
    );
  }

  /**
   * Check if username already exists
   * @param {string} username - Username to check
   * @param {string} excludeUserId - User ID to exclude from check (for updates)
   * @returns {boolean} - True if username exists
   */
  async isUsernameExists(username, excludeUserId = null) {
    const query = { username, deleted: false };
    
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const existingUser = await User.findOne(query);
    return !!existingUser;
  }

  /**
   * Find user by ID for token validation
   * @param {string} userId - User ID
   * @returns {Object} - User object
   */
  async findByIdForAuth(userId) {
    return await User.findOne({ _id: userId, deleted: false }).populate('roles');
  }
}

module.exports = UserRepository; 