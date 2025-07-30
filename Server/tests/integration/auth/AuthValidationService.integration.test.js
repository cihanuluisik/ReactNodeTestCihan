const AuthValidationService = require('../../../services/AuthValidationService');

// Common test utilities to reduce duplication
const AuthTestUtils = {
  // Common validation test patterns
  testValidData: async (validationMethod, validData) => {
    const result = await validationMethod(validData);
    expect(result.error).toBeUndefined();
    expect(result.value).toEqual(validData);
  },

  testInvalidField: async (validationMethod, data, invalidField, expectedError) => {
    const invalidData = { ...data };
    if (invalidField.includes('.')) {
      const [parent, child] = invalidField.split('.');
      invalidData[parent] = { ...invalidData[parent], [child]: invalidData[invalidField] };
      delete invalidData[invalidField];
    } else {
      invalidData[invalidField] = invalidData[invalidField] || '';
    }

    const result = await validationMethod(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error.details[0].message).toBe(expectedError);
    expect(result.value).toEqual(invalidData);
  },

  testMissingField: async (validationMethod, data, missingField, expectedError) => {
    const invalidData = { ...data };
    delete invalidData[missingField];

    const result = await validationMethod(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error.details[0].message).toBe(expectedError);
    expect(result.value).toEqual(invalidData);
  },

  testDelegation: async (validationMethod, validInput, expectedResult = true) => {
    const result = await validationMethod(validInput);
    expect(result).toBe(expectedResult);
  },

  testNullUndefinedHandling: async (validationMethods) => {
    const nullInputs = [null, undefined];
    
    for (const [methodName, method] of Object.entries(validationMethods)) {
      for (const input of nullInputs) {
        const result = await method(input);
        expect(result).toBe(false);
      }
    }
  }
};

describe('AuthValidationService Integration Tests', () => {
  beforeEach(() => {
    // Clear cache before each test
    AuthValidationService.clearCache();
  });

  describe('validateLoginData', () => {
    const validLoginData = {
      username: 'test@example.com',
      password: 'password123'
    };

    it('should validate correct login data', async () => {
      await AuthTestUtils.testValidData(
        AuthValidationService.validateLoginData,
        validLoginData
      );
    });

    it('should reject invalid login data', async () => {
      const invalidCases = [
        {
          data: { ...validLoginData, username: 'invalid-email' },
          expectedError: 'Username must be a valid email address'
        },
        {
          data: { ...validLoginData, password: '123' },
          expectedError: 'Password must be at least 6 characters long'
        }
      ];

      for (const { data, expectedError } of invalidCases) {
        const result = await AuthValidationService.validateLoginData(data);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toBe(expectedError);
        expect(result.value).toEqual(data);
      }
    });

    it('should reject missing required fields', async () => {
      const missingFieldCases = [
        { field: 'username', expectedError: 'Username must be a valid email address' },
        { field: 'password', expectedError: 'Password must be at least 6 characters long' }
      ];

      for (const { field, expectedError } of missingFieldCases) {
        await AuthTestUtils.testMissingField(
          AuthValidationService.validateLoginData,
          validLoginData,
          field,
          expectedError
        );
      }
    });
  });

  describe('validateRegisterData', () => {
    const validRegisterData = {
      username: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should validate correct registration data', async () => {
      await AuthTestUtils.testValidData(
        AuthValidationService.validateRegisterData,
        validRegisterData
      );
    });

    it('should validate registration data with phone number', async () => {
      const dataWithPhone = { ...validRegisterData, phoneNumber: '1234567890' };
      await AuthTestUtils.testValidData(
        AuthValidationService.validateRegisterData,
        dataWithPhone
      );
    });

    it('should reject invalid registration data', async () => {
      const invalidCases = [
        {
          data: { ...validRegisterData, username: 'invalid-email' },
          expectedError: 'Username must be a valid email address'
        },
        {
          data: { ...validRegisterData, password: '123' },
          expectedError: 'Password must be at least 6 characters long'
        },
        {
          data: { ...validRegisterData, firstName: 'J' },
          expectedError: 'First name must be at least 2 characters long'
        },
        {
          data: { ...validRegisterData, lastName: 'D' },
          expectedError: 'Last name must be at least 2 characters long'
        }
      ];

      for (const { data, expectedError } of invalidCases) {
        const result = await AuthValidationService.validateRegisterData(data);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].message).toBe(expectedError);
        expect(result.value).toEqual(data);
      }
    });
  });

  describe('validateAdminRegisterData', () => {
    const validAdminData = {
      username: 'admin@example.com',
      password: 'adminpassword123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'superAdmin'
    };

    it('should validate correct admin registration data', async () => {
      await AuthTestUtils.testValidData(
        AuthValidationService.validateAdminRegisterData,
        validAdminData
      );
    });

    it('should validate admin registration data with phone number', async () => {
      const dataWithPhone = { ...validAdminData, phoneNumber: '9876543210' };
      await AuthTestUtils.testValidData(
        AuthValidationService.validateAdminRegisterData,
        dataWithPhone
      );
    });

    it('should apply same validation rules as regular registration', async () => {
      const invalidAdminData = {
        username: 'invalid-email',
        password: '123',
        firstName: 'A',
        lastName: 'B',
        role: 'superAdmin'
      };

      const result = await AuthValidationService.validateAdminRegisterData(invalidAdminData);
      expect(result.error).toBeDefined();
      expect(result.error.details.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Delegation to DynamicValidationService', () => {
    const delegationTests = [
      { method: 'validateEmail', input: 'test@example.com' },
      { method: 'validatePassword', input: 'password123' },
      { method: 'validatePasswordStrength', input: 'strongpassword123' },
      { method: 'validateTokenFormat', input: 'header.payload.signature' },
      { method: 'validateUserRole', input: 'user' },
      { method: 'validatePhoneNumber', input: '1234567890' }
    ];

    it('should delegate validation methods to DynamicValidationService', async () => {
      for (const { method, input } of delegationTests) {
        await AuthTestUtils.testDelegation(
          AuthValidationService[method],
          input
        );
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle validation schema not found', async () => {
      const result = await AuthValidationService.validateEmail('invalid-email');
      expect(result).toBe(false);
    });

    it('should handle null/undefined inputs gracefully', async () => {
      const validationMethods = {
        validateEmail: AuthValidationService.validateEmail,
        validatePassword: AuthValidationService.validatePassword
      };

      await AuthTestUtils.testNullUndefinedHandling(validationMethods);
    });
  });
});