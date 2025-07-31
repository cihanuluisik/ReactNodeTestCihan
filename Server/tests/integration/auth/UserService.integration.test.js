const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserService = require('../../../services/UserService');
const User = require('../../../model/schema/user');
const { config } = require('../../../config/environment');

describe('UserService Integration Tests', () => {
  let testUserData;

  beforeAll(async () => {
    // Create test user data
    testUserData = {
      username: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: 1234567890
    };
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  });

  describe('createUser', () => {
    it('should handle database errors during user creation', async () => {
      // Mock User.save to throw an error
      const originalSave = User.prototype.save;
      User.prototype.save = jest.fn().mockRejectedValue(new Error('Database save failed'));

      const result = await UserService.createUser(testUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An error occurred during user creation');

      // Restore original method
      User.prototype.save = originalSave;
    });

    it('should hash password correctly', async () => {
      const result = await UserService.createUser(testUserData);

      expect(result.success).toBe(true);
      
      // Verify password is hashed
      const isPasswordHashed = await bcrypt.compare(testUserData.password, result.user.password);
      expect(isPasswordHashed).toBe(true);
    });
  });

  describe('createAdminUser', () => {
    it('should handle database errors during admin creation', async () => {
      // Mock User.save to throw an error
      const originalSave = User.prototype.save;
      User.prototype.save = jest.fn().mockRejectedValue(new Error('Database save failed'));

      const result = await UserService.createAdminUser(testUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An error occurred during admin creation');

      // Restore original method
      User.prototype.save = originalSave;
    });
  });

  describe('findUserByEmail', () => {
    it('should find deleted users when includeDeleted is true', async () => {
      // Create and delete a user
      const createdUser = await UserService.createUser(testUserData);
      await UserService.deleteUser(createdUser.user._id);

      const user = await UserService.findUserByEmail(testUserData.username, true);

      expect(user).toBeDefined();
      expect(user.username).toBe(testUserData.username);
      expect(user.deleted).toBe(true);
    });
  });

  describe('findUserById', () => {
    it('should find deleted users when includeDeleted is true', async () => {
      // Create and delete a user
      const createdUser = await UserService.createUser(testUserData);
      await UserService.deleteUser(createdUser.user._id);

      const user = await UserService.findUserById(createdUser.user._id, true);

      expect(user).toBeDefined();
      expect(user.username).toBe(testUserData.username);
      expect(user.deleted).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('should handle database errors during user update', async () => {
      // Mock User.findOneAndUpdate to throw an error
      const originalFindOneAndUpdate = User.findOneAndUpdate;
      User.findOneAndUpdate = jest.fn().mockRejectedValue(new Error('Database update failed'));

      const fakeId = new mongoose.Types.ObjectId();
      const result = await UserService.updateUser(fakeId, { firstName: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update user');

      // Restore original method
      User.findOneAndUpdate = originalFindOneAndUpdate;
    });
  });

  describe('deleteUser', () => {
    it('should handle database errors during user deletion', async () => {
      // Mock User.findOneAndUpdate to throw an error
      const originalFindOneAndUpdate = User.findOneAndUpdate;
      User.findOneAndUpdate = jest.fn().mockRejectedValue(new Error('Database delete failed'));

      const fakeId = new mongoose.Types.ObjectId();
      const result = await UserService.deleteUser(fakeId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete user');

      // Restore original method
      User.findOneAndUpdate = originalFindOneAndUpdate;
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid ObjectId gracefully', async () => {
      const result = await UserService.findUserById('invalid-id');
      expect(result).toBeNull();
    });

    it('should handle null/undefined inputs gracefully', async () => {
      const result = await UserService.findUserByEmail(null);
      expect(result).toBeNull();
    });

    it('should handle special characters in user data', async () => {
      const specialUserData = {
        ...testUserData,
        username: 'test+special@example.com',
        firstName: 'Test-User',
        lastName: 'O\'Connor'
      };

      const result = await UserService.createUser(specialUserData);

      expect(result.success).toBe(true);
      expect(result.user.username).toBe('test+special@example.com');
      expect(result.user.firstName).toBe('Test-User');
      expect(result.user.lastName).toBe('O\'Connor');
    });
  });
}); 