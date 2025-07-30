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

  // Common validation test patterns
  testSuccessfulValidation: async (validationMethod, username, password, expectedUser) => {
    const result = await validationMethod(username, password);
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.username).toBe(expectedUser.username);
    expect(result.user.firstName).toBe(expectedUser.firstName);
    expect(result.user.lastName).toBe(expectedUser.lastName);
  },

  testFailedValidation: async (validationMethod, username, password, expectedError) => {
    const result = await validationMethod(username, password);
    expect(result.success).toBe(false);
    expect(result.error).toBe(expectedError);
    expect(result.user).toBeUndefined();
  },

  testTokenGeneration: (userId) => {
    const token = authService.generateToken(userId);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    // Verify token can be decoded
    const decoded = jwt.verify(token, config.jwt.secret);
    expect(decoded.userId).toBe(userId);
    return token;
  },

  testSuccessfulLogin: async (username, password, expectedUser) => {
    const result = await authService.login(username, password);
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.username).toBe(expectedUser.username);
    
    // Verify token is valid
    const decoded = jwt.verify(result.token, config.jwt.secret);
    expect(decoded.userId).toBe(expectedUser._id.toString());
    return result;
  },

  testFailedLogin: async (username, password, expectedError) => {
    const result = await authService.login(username, password);
    expect(result.success).toBe(false);
    expect(result.error).toBe(expectedError);
    expect(result.token).toBeUndefined();
    expect(result.user).toBeUndefined();
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
    it('should successfully validate correct credentials', async () => {
      await AuthServiceTestUtils.testSuccessfulValidation(
        authService.validateCredentials.bind(authService),
        testUserData.username,
        testUserData.password,
        testUserData
      );
    });

    it('should fail validation with incorrect credentials', async () => {
      const invalidCases = [
        {
          username: 'wrong@example.com',
          password: testUserData.password,
          expectedError: 'Authentication failed, invalid username'
        },
        {
          username: testUserData.username,
          password: 'wrongpassword',
          expectedError: 'Authentication failed, password does not match'
        }
      ];

      for (const { username, password, expectedError } of invalidCases) {
        await AuthServiceTestUtils.testFailedValidation(
          authService.validateCredentials.bind(authService),
          username,
          password,
          expectedError
        );
      }
    });

    it('should not find deleted users', async () => {
      // Mark user as deleted
      await User.updateOne(
        { _id: testUser._id },
        { $set: { deleted: true } }
      );

      await AuthServiceTestUtils.testFailedValidation(
        authService.validateCredentials.bind(authService),
        testUserData.username,
        testUserData.password,
        'Authentication failed, invalid username'
      );
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      AuthServiceTestUtils.testTokenGeneration(testUser._id.toString());
    });

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
    it('should successfully complete login process', async () => {
      await AuthServiceTestUtils.testSuccessfulLogin(
        testUserData.username,
        testUserData.password,
        testUser
      );
    });

    it('should fail login with invalid credentials', async () => {
      await AuthServiceTestUtils.testFailedLogin(
        testUserData.username,
        'wrongpassword',
        'Authentication failed, password does not match'
      );
    });

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

      await AuthServiceTestUtils.testSuccessfulValidation(
        authService.validateCredentials.bind(authService),
        'test+special@example.com',
        'password!@#$%',
        { username: 'test+special@example.com', firstName: 'Special', lastName: 'User' }
      );
    });
  });
}); 