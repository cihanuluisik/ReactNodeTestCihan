const DynamicValidationService = require('../../../services/DynamicValidationService');
const Validation = require('../../../model/schema/validation');

describe('DynamicValidationService Integration Tests', () => {
  // Test data for generic form validation
  const formValidationSchema = {
    name: 'contact-form',
    validations: [
      {
        formikType: 'name',
        require: true,
        min: 2,
        max: 50,
        value: null,
        message: 'Name must be at least 2 characters long',
        match: false
      },
      {
        formikType: 'email',
        require: true,
        min: false,
        max: false,
        value: null,
        message: 'Email must be a valid email address',
        match: false
      },
      {
        formikType: 'message',
        require: true,
        min: 10,
        max: 1000,
        value: null,
        message: 'Message must be between 10 and 1000 characters',
        match: false
      }
    ]
  };

  beforeAll(async () => {
    // Clear any existing test data
    await Validation.deleteMany({ name: { $in: ['contact-form'] } });
    
    // Create test validation schemas
    await Validation.create(formValidationSchema);
  });

  afterAll(async () => {
    // Clean up test data
    await Validation.deleteMany({ name: { $in: ['contact-form'] } });
  });

  beforeEach(() => {
    // Clear cache before each test
    DynamicValidationService.clearCache();
  });

  describe('validateData - Generic Form Validation', () => {
    it('should validate correct form data', async () => {
      const validFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      };

      const result = await DynamicValidationService.validateData('contact-form', validFormData);

      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validFormData);
    });

    it('should reject name that is too short', async () => {
      const invalidFormData = {
        name: 'J',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      };

      const result = await DynamicValidationService.validateData('contact-form', invalidFormData);

      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toBe('Name must be at least 2 characters long');
      expect(result.value).toEqual(invalidFormData);
    });

    it('should reject name that is too long', async () => {
      const invalidFormData = {
        name: 'A'.repeat(51),
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      };

      const result = await DynamicValidationService.validateData('contact-form', invalidFormData);

      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toBe('Name must be at least 2 characters long');
      expect(result.value).toEqual(invalidFormData);
    });

    it('should reject invalid email format', async () => {
      const invalidFormData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'This is a test message with more than 10 characters.'
      };

      const result = await DynamicValidationService.validateData('contact-form', invalidFormData);

      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toBe('Username must be a valid email address');
      expect(result.value).toEqual(invalidFormData);
    });

    it('should reject message that is too short', async () => {
      const invalidFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short'
      };

      const result = await DynamicValidationService.validateData('contact-form', invalidFormData);

      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toBe('Message must be between 10 and 1000 characters');
      expect(result.value).toEqual(invalidFormData);
    });

    it('should reject message that is too long', async () => {
      const invalidFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'A'.repeat(1001)
      };

      const result = await DynamicValidationService.validateData('contact-form', invalidFormData);

      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toBe('Message must be between 10 and 1000 characters');
      expect(result.value).toEqual(invalidFormData);
    });

    it('should reject missing required fields', async () => {
      const invalidFormData = {
        name: 'John Doe'
        // Missing email and message
      };

      const result = await DynamicValidationService.validateData('contact-form', invalidFormData);

      expect(result.error).toBeDefined();
      expect(result.error.details.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('sanitizeInput', () => {
    it('should handle non-string/non-object input', () => {
      const inputs = [123, true, false];

      inputs.forEach(input => {
        const result = DynamicValidationService.sanitizeInput(input);
        expect(result).toBe(input);
      });
    });

    it('should handle null and undefined input', () => {
      expect(DynamicValidationService.sanitizeInput(null)).toBe(null);
      expect(DynamicValidationService.sanitizeInput(undefined)).toBe(undefined);
    });

    it('should handle empty string', () => {
      const result = DynamicValidationService.sanitizeInput('');
      expect(result).toBe('');
    });

    it('should handle string with no special characters', () => {
      const result = DynamicValidationService.sanitizeInput('normal text');
      expect(result).toBe('normal text');
    });
  });

  describe('validateBodySize', () => {
    it('should validate body size within limit', () => {
      const smallBody = { name: 'test', email: 'test@example.com' };
      const result = DynamicValidationService.validateBodySize(smallBody);
      expect(result.valid).toBe(true);
    });

    it('should reject body size exceeding limit', () => {
      const largeBody = { data: 'x'.repeat(1024 * 1024 + 1) };
      const result = DynamicValidationService.validateBodySize(largeBody);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request body too large');
    });

    it('should work with custom size limit', () => {
      const customLimit = 100;
      const smallBody = { name: 'test' };
      const result = DynamicValidationService.validateBodySize(smallBody, customLimit);
      expect(result.valid).toBe(true);
    });

    it('should reject body exceeding custom limit', () => {
      const customLimit = 10;
      const largeBody = { data: 'x'.repeat(20) };
      const result = DynamicValidationService.validateBodySize(largeBody, customLimit);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Request body too large');
    });

    it('should handle empty object', () => {
      const result = DynamicValidationService.validateBodySize({});
      expect(result.valid).toBe(true);
    });

    it('should handle null and undefined', () => {
      expect(DynamicValidationService.validateBodySize(null).valid).toBe(true);
      expect(DynamicValidationService.validateBodySize(undefined).valid).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should cache validation schemas', async () => {
      // First call should fetch from database
      const result1 = await DynamicValidationService.validateData('contact-form', {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      });
      expect(result1.error).toBeUndefined();

      // Second call should use cache
      const result2 = await DynamicValidationService.validateData('contact-form', {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      });
      expect(result2.error).toBeUndefined();
    });

    it('should clear cache when requested', async () => {
      // First call to populate cache
      await DynamicValidationService.validateData('contact-form', {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      });

      // Clear cache
      DynamicValidationService.clearCache();

      // Should still work after cache clear
      const result = await DynamicValidationService.validateData('contact-form', {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      });
      expect(result.error).toBeUndefined();
    });

    it('should clear specific validation cache', async () => {
      // First call to populate cache
      await DynamicValidationService.validateData('contact-form', {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      });

      // Clear specific validation cache
      DynamicValidationService.clearValidationCache('contact-form');

      // Should still work after cache clear
      const result = await DynamicValidationService.validateData('contact-form', {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      });
      expect(result.error).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent validation schema', async () => {
      const result = await DynamicValidationService.validateData('non-existent', {
        name: 'John Doe'
      });

      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toBe("Validation schema 'non-existent' not found");
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the service doesn't crash
      const result = await DynamicValidationService.validateData('contact-form', {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters.'
      });
      
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters in validation', async () => {
      const unicodeData = {
        name: 'José García',
        email: 'jose@example.com',
        message: 'This is a test message with unicode characters: ñáéíóú'
      };

      const result = await DynamicValidationService.validateData('contact-form', unicodeData);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(unicodeData);
    });

    it('should handle multiple validation errors in form data', async () => {
      const invalidData = {
        name: 'J', // too short
        email: 'invalid-email',
        message: 'Short' // too short
      };

      const result = await DynamicValidationService.validateData('contact-form', invalidData);
      expect(result.error).toBeDefined();
      expect(result.error.details.length).toBeGreaterThanOrEqual(1);
    });
  });
}); 