const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repository/UserRepository');
const { config } = require('../config/environment');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }
  /**
   * Validates user credentials against database
   * @param {string} username - User's email
   * @param {string} password - User's password
   * @returns {Object} - { success: boolean, user?: Object, error?: string }
   */
  async validateCredentials(username, password) {
    try {
      const user = await this.userRepository.findByUsername(username);
      
      if (!user) {
        return { success: false, error: 'Authentication failed, invalid username' };
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return { success: false, error: 'Authentication failed, password does not match' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Credential validation error:', error);
      return { success: false, error: 'Authentication service error' };
    }
  }

  /**
   * Generates JWT token for authenticated user
   * @param {string} userId - User's ID
   * @returns {string} - JWT token
   */
  generateToken(userId) {
    try {
      return jwt.sign(
        { userId }, 
        config.jwt.secret, 
        { expiresIn: config.jwt.expiresIn }
      );
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Handles complete login process
   * @param {string} username - User's email
   * @param {string} password - User's password
   * @returns {Object} - { success: boolean, token?: string, user?: Object, error?: string }
   */
  async login(username, password) {
    try {
      const credentialResult = await this.validateCredentials(username, password);
      
      if (!credentialResult.success) {
        return credentialResult;
      }

      const token = this.generateToken(credentialResult.user._id);
      
      return {
        success: true,
        token,
        user: credentialResult.user
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }
}

module.exports = AuthService; 