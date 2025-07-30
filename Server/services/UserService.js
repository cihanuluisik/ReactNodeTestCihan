const bcrypt = require('bcrypt');
const User = require('../model/schema/user');
const { config } = require('../config/environment');

class UserService {
  /**
   * Creates a new user with hashed password
   * @param {Object} userData - User data (username, password, firstName, lastName, phoneNumber)
   * @returns {Object} - { success: boolean, user?: Object, error?: string }
   */
  async createUser(userData) {
    try {
      const { username, password, firstName, lastName, phoneNumber } = userData;
      
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return { success: false, error: 'User already exists, please try another email' };
      }

      // Hash the password using environment config
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptSaltRounds);
      
      // Create a new user
      const user = new User({ 
        username, 
        password: hashedPassword, 
        firstName, 
        lastName, 
        phoneNumber, 
        createdDate: new Date() 
      });
      
      // Save the user to the database
      await user.save();
      return { success: true, user };
    } catch (error) {
      console.error('User creation error:', error);
      return { success: false, error: 'An error occurred during user creation' };
    }
  }

  /**
   * Creates a new admin user with superAdmin role
   * @param {Object} userData - User data (username, password, firstName, lastName, phoneNumber)
   * @returns {Object} - { success: boolean, user?: Object, error?: string }
   */
  async createAdminUser(userData) {
    try {
      const { username, password, firstName, lastName, phoneNumber } = userData;
      
      // Check if admin already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return { success: false, error: 'Admin already exist please try another email' };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptSaltRounds);
      
      // Create a new admin user
      const user = new User({ 
        username, 
        password: hashedPassword, 
        firstName, 
        lastName, 
        phoneNumber, 
        role: 'superAdmin',
        createdDate: new Date()
      });
      
      // Save the user to the database
      await user.save();
      return { success: true, user };
    } catch (error) {
      console.error('Admin creation error:', error);
      return { success: false, error: 'An error occurred during admin creation' };
    }
  }

  /**
   * Finds user by email/username
   * @param {string} username - User's email/username
   * @param {boolean} includeDeleted - Whether to include deleted users
   * @returns {Object} - User object or null
   */
  async findUserByEmail(username, includeDeleted = false) {
    try {
      const query = { username };
      if (!includeDeleted) {
        query.deleted = false;
      }
      
      const user = await User.findOne(query).populate({
        path: 'roles'
      });
      
      return user;
    } catch (error) {
      console.error('User lookup error:', error);
      return null;
    }
  }

  /**
   * Finds user by ID
   * @param {string} userId - User's ID
   * @param {boolean} includeDeleted - Whether to include deleted users
   * @returns {Object} - User object or null
   */
  async findUserById(userId, includeDeleted = false) {
    try {
      const query = { _id: userId };
      if (!includeDeleted) {
        query.deleted = false;
      }
      
      const user = await User.findOne(query).populate({
        path: 'roles'
      });
      
      return user;
    } catch (error) {
      console.error('User lookup error:', error);
      return null;
    }
  }

  /**
   * Updates user information
   * @param {string} userId - User's ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - { success: boolean, result?: Object, error?: string }
   */
  async updateUser(userId, updateData) {
    try {
      const result = await User.updateOne(
        { _id: userId },
        { $set: updateData }
      );
      
      return { success: true, result };
    } catch (error) {
      console.error('User update error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  /**
   * Soft deletes a user (sets deleted flag to true)
   * @param {string} userId - User's ID
   * @returns {Object} - { success: boolean, result?: Object, error?: string }
   */
  async deleteUser(userId) {
    try {
      const result = await User.updateOne(
        { _id: userId },
        { $set: { deleted: true } }
      );
      
      return { success: true, result };
    } catch (error) {
      console.error('User deletion error:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }
}

module.exports = new UserService(); 