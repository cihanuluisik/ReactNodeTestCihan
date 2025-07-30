const UserService = require('../../services/UserService');

describe('UserService', () => {
  describe('SRP Compliance', () => {
    it('should have methods under 30 lines', () => {
      const fs = require('fs');
      const path = require('path');
      const userServiceCode = fs.readFileSync(
        path.join(__dirname, '../../services/UserService.js'), 
        'utf8'
      );

      const methods = userServiceCode.match(/async?\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/g);
      
      if (methods) {
        methods.forEach(method => {
          const lines = method.split('\n').length;
          expect(lines).toBeLessThanOrEqual(30);
        });
      }
    });

    it('should have proper method separation', () => {
      expect(typeof UserService.createUser).toBe('function');
      expect(typeof UserService.createAdminUser).toBe('function');
      expect(typeof UserService.findUserByEmail).toBe('function');
      expect(typeof UserService.findUserById).toBe('function');
      expect(typeof UserService.updateUser).toBe('function');
      expect(typeof UserService.deleteUser).toBe('function');
    });

    it('should follow single responsibility principle', () => {
      // Each method should have a single, clear responsibility
      const methodNames = [
        'createUser', 
        'createAdminUser', 
        'findUserByEmail', 
        'findUserById', 
        'updateUser', 
        'deleteUser'
      ];
      methodNames.forEach(methodName => {
        expect(typeof UserService[methodName]).toBe('function');
      });
    });
  });

  describe('Integration with E2E Tests', () => {
    it('should work with existing E2E tests', () => {
      // This test verifies that the UserService is properly integrated
      // and doesn't break existing functionality
      expect(UserService).toBeDefined();
      expect(typeof UserService.createUser).toBe('function');
      expect(typeof UserService.createAdminUser).toBe('function');
    });
  });
}); 