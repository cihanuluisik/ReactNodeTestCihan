const bcrypt = require('bcrypt');
const UserRepository = require('../repository/UserRepository');
const User = require('../model/schema/user');
const { config } = require('../config/environment');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Creates a new user with hashed password
   * @param {Object} userData - User data (username, password, firstName, lastName, phoneNumber)
   * @returns {Object} - { success: boolean, user?: Object, error?: string }
   */
  async createUser(userData) {
    try {
      const { username, password, firstName, lastName, phoneNumber } = userData;
      
      // Check if user already exists
      const existingUser = await this.userRepository.findByUsername(username);
      if (existingUser) {
        return { success: false, error: 'User already exists, please try another email' };
      }

      // Hash the password using environment config
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptSaltRounds);
      
      // Create user data for repository
      const userDataForRepo = {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        createdDate: new Date()
      };
      
      // Create a new user using repository
      const user = await this.userRepository.create(userDataForRepo, null);
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
      const existingUser = await this.userRepository.findByUsername(username);
      if (existingUser) {
        return { success: false, error: 'Admin already exist please try another email' };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptSaltRounds);
      
      // Create admin user data for repository
      const userDataForRepo = {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: 'superAdmin',
        createdDate: new Date()
      };
      
      // Create a new admin user using repository
      const user = await this.userRepository.create(userDataForRepo, null);
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
      if (includeDeleted) {
        // For deleted users, we need to query directly since repository doesn't support this
        const query = { username };
        const user = await User.findOne(query).populate({
          path: 'roles'
        });
        return user;
      }
      
      return await this.userRepository.findByUsername(username);
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
      if (includeDeleted) {
        // For deleted users, we need to query directly since repository doesn't support this
        const query = { _id: userId };
        const user = await User.findOne(query).populate({
          path: 'roles'
        });
        return user;
      }
      
      // Use repository with superAdmin role to bypass restrictions
      return await this.userRepository.findById(userId, userId, 'superAdmin');
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
      const result = await this.userRepository.update(userId, updateData, userId, 'superAdmin');
      
      if (result) {
        return { success: true, result: { modifiedCount: 1 } };
      } else {
        return { success: true, result: { modifiedCount: 0 } };
      }
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
      const result = await this.userRepository.delete(userId, userId, 'superAdmin');
      
      if (result) {
        return { success: true, result: { modifiedCount: 1 } };
      } else {
        return { success: true, result: { modifiedCount: 0 } };
      }
    } catch (error) {
      console.error('User deletion error:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }
}

module.exports = new UserService(); 