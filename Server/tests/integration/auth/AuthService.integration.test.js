const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthService = require('../../../services/AuthService');
const User = require('../../../model/schema/user');
const { config } = require('../../../config/environment');

// Create an instance of AuthService for testing
const authService = new AuthService();

// Common test utilities to reduce duplication
const AuthServiceTestUtils = {
  // Common test data
  createTestUserData: () => ({
    username: 'test@example.com',
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: 1234567890
  }),

  testTokenGeneration: (userId) => {
    const token = authService.generateToken(userId);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    // Verify token can be decoded
    const decoded = jwt.verify(token, config.jwt.secret);
    expect(decoded.userId).toBe(userId);
    return token;
  },

  testErrorHandling: async (testFunction, expectedError) => {
    const result = await testFunction();
    expect(result.success).toBe(false);
    expect(result.error).toBe(expectedError);
  },

  testInputHandling: async (validationMethod, invalidInputs, expectedError) => {
    for (const input of invalidInputs) {
      const result = await validationMethod(input.username, input.password);
      expect(result.success).toBe(false);
      expect(result.error).toBe(expectedError);
    }
  },

  // Mock utilities
  mockMethod: (service, methodName, mockImplementation) => {
    const originalMethod = service[methodName];
    service[methodName] = jest.fn().mockImplementation(mockImplementation);
    return () => { service[methodName] = originalMethod; };
  }
};

describe('AuthService Integration Tests', () => {
  let testUser;
  let testUserData;

  beforeAll(async () => {
    // Create test user data
    testUserData = AuthServiceTestUtils.createTestUserData();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    
    // Create a test user for each test
    const hashedPassword = await bcrypt.hash(testUserData.password, config.security.bcryptSaltRounds);
    testUser = new User({
      ...testUserData,
      password: hashedPassword,
      createdDate: new Date()
    });
    await testUser.save();
  });

  describe('validateCredentials', () => {
    it('should not find deleted users', async () => {
      // Mark user as deleted
      await User.updateOne(
        { _id: testUser._id },
        { $set: { deleted: true } }
      );

      const result = await authService.validateCredentials(testUserData.username, testUserData.password);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed, invalid username');
    });
  });

  describe('generateToken', () => {
    it('should handle token generation errors', () => {
      const restoreMock = AuthServiceTestUtils.mockMethod(
        jwt,
        'sign',
        () => { throw new Error('JWT signing failed'); }
      );

      expect(() => {
        authService.generateToken(testUser._id.toString());
      }).toThrow('Failed to generate authentication token');

      restoreMock();
    });
  });

  describe('login', () => {
    it('should handle login process errors gracefully', async () => {
      const restoreMock = AuthServiceTestUtils.mockMethod(
        authService,
        'validateCredentials',
        () => Promise.reject(new Error('Service error'))
      );

      await AuthServiceTestUtils.testErrorHandling(
        () => authService.login(testUserData.username, testUserData.password),
        'An error occurred during login'
      );

      restoreMock();
    });

    it('should handle token generation failure during login', async () => {
      const restoreMock = AuthServiceTestUtils.mockMethod(
        authService,
        'generateToken',
        () => { throw new Error('Token generation failed'); }
      );

      await AuthServiceTestUtils.testErrorHandling(
        () => authService.login(testUserData.username, testUserData.password),
        'An error occurred during login'
      );

      restoreMock();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined inputs gracefully', async () => {
      const invalidInputs = [
        { username: null, password: null },
        { username: '', password: '' }
      ];

      await AuthServiceTestUtils.testInputHandling(
        authService.validateCredentials.bind(authService),
        invalidInputs,
        'Authentication failed, invalid username'
      );
    });

    it('should handle special characters in credentials', async () => {
      const specialUser = new User({
        username: 'test+special@example.com',
        password: await bcrypt.hash('password!@#$%', config.security.bcryptSaltRounds),
        firstName: 'Special',
        lastName: 'User',
        phoneNumber: 1234567890,
        createdDate: new Date()
      });
      await specialUser.save();

      const result = await authService.validateCredentials('test+special@example.com', 'password!@#$%');
      expect(result.success).toBe(true);
      expect(result.user.username).toBe('test+special@example.com');
      expect(result.user.firstName).toBe('Special');
      expect(result.user.lastName).toBe('User');
    });
  });
}); 