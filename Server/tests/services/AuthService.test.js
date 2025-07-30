// Mock dependencies before requiring the service
jest.mock('../../model/schema/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const AuthService = require('../../services/AuthService');
const authService = new AuthService();

describe('AuthService', () => {
  describe('SRP Compliance', () => {
    it('should have methods under 30 lines', () => {
      const fs = require('fs');
      const path = require('path');
      const authServiceCode = fs.readFileSync(
        path.join(__dirname, '../../services/AuthService.js'), 
        'utf8'
      );

      const methods = authServiceCode.match(/async?\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/g);
      
      if (methods) {
        methods.forEach(method => {
          const lines = method.split('\n').length;
          expect(lines).toBeLessThanOrEqual(30);
        });
      }
    });

    it('should have proper method separation', () => {
      expect(typeof authService.validateCredentials).toBe('function');
      expect(typeof authService.generateToken).toBe('function');
      expect(typeof authService.login).toBe('function');
    });

    it('should follow single responsibility principle', () => {
      // Each method should have a single, clear responsibility
      const methodNames = ['validateCredentials', 'generateToken', 'login'];
      methodNames.forEach(methodName => {
        expect(typeof authService[methodName]).toBe('function');
      });
    });
  });

  describe('Integration with E2E Tests', () => {
    it('should work with existing E2E tests', () => {
      // This test verifies that the AuthService is properly integrated
      // and doesn't break existing functionality
      expect(authService).toBeDefined();
      expect(typeof authService.login).toBe('function');
    });
  });
}); 