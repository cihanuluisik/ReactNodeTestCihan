const mongoose = require('mongoose');
const MeetingValidationService = require('../../../services/MeetingValidationService');
const DynamicValidationService = require('../../../services/DynamicValidationService');
const Validation = require('../../../model/schema/validation');

// Common test utilities to reduce duplication
const TestUtils = {
  createValidObjectId: () => new mongoose.Types.ObjectId().toString(),
  createLargeData: (field, size = 1024 * 1024) => ({ [field]: 'A'.repeat(size) }),
  createXssData: (field, content) => ({ [field]: `<script>alert("xss")</script>${content}` }),
  
  // Common validation test patterns
  testRequiredField: async (validationMethod, data, missingField, expectedError) => {
    const invalidData = { ...data };
    delete invalidData[missingField];
    
    const result = await validationMethod(invalidData);
    expect(result.success).toBe(false);
    expect(result.error).toContain(expectedError);
  },
  
  testOversizedData: async (validationMethod, data, field = 'agenda') => {
    const largeData = { ...data, [field]: 'A'.repeat(1024 * 1024) };
    const result = await validationMethod(largeData);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Request body too large');
  },
  
  testXssSanitization: async (validationMethod, data, field, content) => {
    const xssData = { ...data, [field]: `<script>alert("xss")</script>${content}` };
    const result = await validationMethod(xssData);
    expect(result.success).toBe(true);
    expect(result.data[field]).not.toContain('<script>');
    expect(result.data[field]).toContain(content);
  },
  
  testIdValidation: (validationMethod, validId, invalidCases) => {
    // Test valid ID
    const result = validationMethod(validId);
    expect(result.success).toBe(true);
    
    // Test invalid cases
    invalidCases.forEach(({ input, expectedError }) => {
      const invalidResult = validationMethod(input);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBe(expectedError);
    });
  },
  
  testQueryParamValidation: (validationMethod, validParams, invalidCases) => {
    // Test valid parameters
    const result = validationMethod(validParams);
    expect(result.success).toBe(true);
    Object.entries(validParams).forEach(([key, value]) => {
      expect(result.data[key]).toBe(value);
    });
    
    // Test invalid cases
    invalidCases.forEach(({ params, expectedError }) => {
      const invalidResult = validationMethod(params);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toBe(expectedError);
    });
  }
};

describe('MeetingValidationService Integration Tests', () => {
  beforeAll(async () => {
    // Validation schemas are already created in setup.js
    // No need to create them again here
  });

  afterAll(async () => {
    // Clean up is handled by the main test setup
  });

  describe('validateCreateMeeting', () => {
    const validMeetingData = {
      agenda: 'Test Meeting Agenda',
      location: 'Conference Room A',
      dateTime: '2024-01-15T10:00:00Z',
      notes: 'Important meeting notes',
      duration: 60,
      createFor: 'Client Presentation'
    };

    it('should validate valid meeting data with all fields', async () => {
      const result = await MeetingValidationService.validateCreateMeeting(validMeetingData);

      if (!result.success) {
        console.log('Validation failed:', result.error);
      }

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.agenda).toBe(validMeetingData.agenda);
      expect(result.data.location).toBe(validMeetingData.location);
      expect(result.data.dateTime).toBe(validMeetingData.dateTime);
      expect(result.data.notes).toBe(validMeetingData.notes);
      expect(result.data.duration).toBe(validMeetingData.duration);
      expect(result.data.createFor).toBe(validMeetingData.createFor);
    });

    it('should validate valid meeting data with minimal fields', async () => {
      const minimalData = {
        agenda: 'Minimal Meeting',
        dateTime: '2024-01-15T10:00:00Z'
      };

      const result = await MeetingValidationService.validateCreateMeeting(minimalData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.agenda).toBe(minimalData.agenda);
      expect(result.data.dateTime).toBe(minimalData.dateTime);
    });

    it('should reject meeting data without required agenda', async () => {
      await TestUtils.testRequiredField(
        MeetingValidationService.validateCreateMeeting,
        validMeetingData,
        'agenda',
        'Agenda is required'
      );
    });

    it('should reject meeting data without required dateTime', async () => {
      await TestUtils.testRequiredField(
        MeetingValidationService.validateCreateMeeting,
        validMeetingData,
        'dateTime',
        'Date and time is required'
      );
    });

    it('should validate duration within valid range', async () => {
      const dataWithValidDuration = {
        ...validMeetingData,
        duration: 120 // 2 hours
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithValidDuration);

      expect(result.success).toBe(true);
      expect(result.data.duration).toBe(120);
    });

    it('should reject duration below minimum', async () => {
      const dataWithInvalidDuration = {
        ...validMeetingData,
        duration: 10 // Below minimum (15 minutes)
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithInvalidDuration);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Duration must be between 15 and 480 minutes');
    });

    it('should reject duration above maximum', async () => {
      const dataWithInvalidDuration = {
        ...validMeetingData,
        duration: 500 // Above maximum (480 minutes)
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithInvalidDuration);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Duration must be between 15 and 480 minutes');
    });

    it('should handle empty optional fields', async () => {
      const dataWithEmptyFields = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z',
        location: '',
        notes: '',
        createFor: ''
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithEmptyFields);

      expect(result.success).toBe(true);
      expect(result.data.agenda).toBe(dataWithEmptyFields.agenda);
      expect(result.data.dateTime).toBe(dataWithEmptyFields.dateTime);
    });

    it('should handle null optional fields', async () => {
      const dataWithNullFields = {
        agenda: 'Test Meeting',
        dateTime: '2024-01-15T10:00:00Z',
        location: null,
        notes: null,
        createFor: null
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithNullFields);

      expect(result.success).toBe(true);
      expect(result.data.agenda).toBe(dataWithNullFields.agenda);
      expect(result.data.dateTime).toBe(dataWithNullFields.dateTime);
    });

    it('should reject oversized body', async () => {
      await TestUtils.testOversizedData(
        MeetingValidationService.validateCreateMeeting,
        { dateTime: '2024-01-15T10:00:00Z' }
      );
    });

    it('should sanitize input data', async () => {
      await TestUtils.testXssSanitization(
        MeetingValidationService.validateCreateMeeting,
        { dateTime: '2024-01-15T10:00:00Z' },
        'agenda',
        'Test Meeting'
      );
    });

    it('should handle special characters in agenda', async () => {
      const dataWithSpecialChars = {
        ...validMeetingData,
        agenda: 'Test Meeting with special chars: @#$%^&*()_+-=[]{}|;:,.<>?'
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithSpecialChars);

      expect(result.success).toBe(true);
      // Expect sanitized version (<> characters removed for XSS protection)
      expect(result.data.agenda).toBe('Test Meeting with special chars: @#$%^&*()_+-=[]{}|;:,.?');
    });

    it('should handle very long agenda text', async () => {
      const longAgenda = 'A'.repeat(1000);
      const dataWithLongAgenda = {
        ...validMeetingData,
        agenda: longAgenda
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithLongAgenda);

      expect(result.success).toBe(true);
      expect(result.data.agenda).toBe(longAgenda);
    });

    it('should validate different date formats', async () => {
      const dataWithDifferentDate = {
        ...validMeetingData,
        dateTime: '2024-12-31T23:59:59.999Z'
      };

      const result = await MeetingValidationService.validateCreateMeeting(dataWithDifferentDate);

      expect(result.success).toBe(true);
      expect(result.data.dateTime).toBe(dataWithDifferentDate.dateTime);
    });
  });

  describe('validateUpdateMeeting', () => {
    const validUpdateData = {
      agenda: 'Updated Meeting Agenda'
    };

    it('should validate valid update data', async () => {
      const result = await MeetingValidationService.validateUpdateMeeting(validUpdateData);

      expect(result.success).toBe(true);
      expect(result.data.agenda).toBe(validUpdateData.agenda);
    });

    it('should accept 4-character agenda for updates', async () => {
      const updateDataWithShortAgenda = {
        agenda: 'Test'
      };

      const result = await MeetingValidationService.validateUpdateMeeting(updateDataWithShortAgenda);

      expect(result.success).toBe(true);
      expect(result.data.agenda).toBe(updateDataWithShortAgenda.agenda);
    });

    it('should accept 1-character agenda for updates', async () => {
      const updateDataWithMinimalAgenda = {
        agenda: 'A'
      };

      const result = await MeetingValidationService.validateUpdateMeeting(updateDataWithMinimalAgenda);

      expect(result.success).toBe(true);
      expect(result.data.agenda).toBe(updateDataWithMinimalAgenda.agenda);
    });

    it('should reject empty string agenda for updates', async () => {
      const updateDataWithEmptyAgenda = {
        agenda: ''
      };

      const result = await MeetingValidationService.validateUpdateMeeting(updateDataWithEmptyAgenda);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Agenda must be at least 1 character if provided');
    });

    it('should allow createBy field in update data', async () => {
      const updateDataWithCreateBy = {
        agenda: 'Updated Meeting Agenda',
        createBy: '507f1f77bcf86cd799439011' // Valid ObjectId
      };
      
      const result = await MeetingValidationService.validateUpdateMeeting(updateDataWithCreateBy);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.agenda).toBe(updateDataWithCreateBy.agenda);
      expect(result.data.createBy).toBe(updateDataWithCreateBy.createBy);
    });

    it('should allow partial updates', async () => {
      const partialData = { agenda: 'Updated Meeting Agenda' };
      const result = await MeetingValidationService.validateUpdateMeeting(partialData);

      expect(result.success).toBe(true);
      expect(result.data.agenda).toBe(partialData.agenda);
    });

    it('should reject oversized update data', async () => {
      await TestUtils.testOversizedData(
        MeetingValidationService.validateUpdateMeeting,
        {}
      );
    });

    it('should sanitize update input data', async () => {
      await TestUtils.testXssSanitization(
        MeetingValidationService.validateUpdateMeeting,
        {},
        'agenda',
        'Updated Meeting'
      );
    });
  });

  describe('validateMeetingId', () => {
    const validId = TestUtils.createValidObjectId();
    const invalidCases = [
      { input: 'invalid-id-format', expectedError: 'Invalid meeting ID format' },
      { input: null, expectedError: 'Invalid meeting ID format' },
      { input: undefined, expectedError: 'Invalid meeting ID format' },
      { input: 123, expectedError: 'Invalid meeting ID format' }
    ];

    it('should validate meeting ID with various inputs', () => {
      TestUtils.testIdValidation(
        MeetingValidationService.validateMeetingId,
        validId,
        invalidCases
      );
    });
  });

  describe('validateMeetingIds', () => {
    const validIds = [
      TestUtils.createValidObjectId(),
      TestUtils.createValidObjectId(),
      TestUtils.createValidObjectId()
    ];

    it('should validate array of valid IDs', () => {
      const result = MeetingValidationService.validateMeetingIds(validIds);
      expect(result.success).toBe(true);
      expect(result.validIds).toEqual(validIds);
    });

    it('should reject invalid ID arrays', () => {
      const invalidCases = [
        { input: [], expectedError: 'Invalid meeting IDs array' },
        { input: 'not-an-array', expectedError: 'Invalid meeting IDs array' },
        { input: null, expectedError: 'Invalid meeting IDs array' },
        { input: undefined, expectedError: 'Invalid meeting IDs array' }
      ];

      invalidCases.forEach(({ input, expectedError }) => {
        const result = MeetingValidationService.validateMeetingIds(input);
        expect(result.success).toBe(false);
        expect(result.error).toBe(expectedError);
      });
    });

    it('should reject array with invalid IDs', () => {
      const mixedIds = [
        TestUtils.createValidObjectId(),
        'invalid-id',
        TestUtils.createValidObjectId()
      ];

      const result = MeetingValidationService.validateMeetingIds(mixedIds);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid meeting IDs: invalid-id');
    });
  });

  describe('validateQueryParams', () => {
    const validParams = {
      page: '1',
      limit: '10',
      search: 'test'
    };

    const invalidCases = [
      { params: { page: '0', limit: '10' }, expectedError: 'Invalid page number' },
      { params: { page: '1', limit: '150' }, expectedError: 'Invalid limit (must be 1-100)' },
      { params: { page: 'abc', limit: '10' }, expectedError: 'Invalid page number' },
      { params: { page: '1', limit: 'abc' }, expectedError: 'Invalid limit (must be 1-100)' }
    ];

    it('should validate query parameters with various inputs', () => {
      TestUtils.testQueryParamValidation(
        MeetingValidationService.validateQueryParams,
        validParams,
        invalidCases
      );
    });

    it('should sanitize query parameters', async () => {
      const xssParams = {
        page: '1',
        limit: '10',
        search: '<script>alert("xss")</script>test'
      };

      const result = MeetingValidationService.validateQueryParams(xssParams);
      expect(result.success).toBe(true);
      expect(result.data.search).not.toContain('<script>');
      expect(result.data.search).toContain('test');
    });

    it('should handle empty query parameters', () => {
      const result = MeetingValidationService.validateQueryParams({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });
  });
}); 