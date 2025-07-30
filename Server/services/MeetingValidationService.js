const DynamicValidationService = require('./DynamicValidationService');

class MeetingValidationService {
  /**
   * Validate meeting creation data
   * @param {Object} meetingData - Meeting data to validate
   * @returns {Object} - Validation result
   */
  async validateCreateMeeting(meetingData) {
    try {
      // Validate body size first
      const bodySizeResult = DynamicValidationService.validateBodySize(
        JSON.stringify(meetingData)
      );
      if (!bodySizeResult.valid) {
        return { success: false, error: bodySizeResult.error };
      }

      // Sanitize input
      const sanitizedData = DynamicValidationService.sanitizeInput(meetingData);

      // Validate using dynamic validation schema
      const validationResult = await DynamicValidationService.validateData(
        'meeting',
        sanitizedData
      );

      if (validationResult.error) {
        return { 
          success: false, 
          error: validationResult.error.details?.[0]?.message || 'Validation failed' 
        };
      }

      return { success: true, data: sanitizedData };
    } catch (error) {
      console.error('Meeting creation validation error:', error);
      return { success: false, error: 'Validation service error' };
    }
  }

  /**
   * Validate meeting update data
   * @param {Object} updateData - Update data to validate
   * @returns {Object} - Validation result
   */
  async validateUpdateMeeting(updateData) {
    try {
      // Validate body size first
      const bodySizeResult = DynamicValidationService.validateBodySize(
        JSON.stringify(updateData)
      );
      if (!bodySizeResult.valid) {
        return { success: false, error: bodySizeResult.error };
      }

      // Sanitize input
      const sanitizedData = DynamicValidationService.sanitizeInput(updateData);
      
      // Check for empty strings in required fields before filtering
      for (const [key, value] of Object.entries(sanitizedData)) {
        if (value === '') {
          // For agenda field, empty string is not allowed
          if (key === 'agenda') {
            return { 
              success: false, 
              error: 'Agenda must be at least 1 character if provided' 
            };
          }
        }
      }
      
      // For updates, remove empty string fields to allow partial updates
      const cleanedData = {};
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] !== '' && sanitizedData[key] !== null && sanitizedData[key] !== undefined) {
          cleanedData[key] = sanitizedData[key];
        }
      });

      // For updates, we use a more flexible validation schema
      const validationResult = await DynamicValidationService.validateData(
        'meetingUpdate',
        cleanedData
      );

      if (validationResult.error) {
        return { 
          success: false, 
          error: validationResult.error.details?.[0]?.message || 'Validation failed' 
        };
      }

      return { success: true, data: cleanedData };
    } catch (error) {
      console.error('Meeting update validation error:', error);
      return { success: false, error: 'Validation service error' };
    }
  }

  /**
   * Validate meeting ID format
   * @param {string} meetingId - Meeting ID to validate
   * @returns {Object} - Validation result
   */
  validateMeetingId(meetingId) {
    try {
      if (!meetingId || typeof meetingId !== 'string') {
        return { success: false, error: 'Invalid meeting ID format' };
      }

      // Basic MongoDB ObjectId validation
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (!objectIdPattern.test(meetingId)) {
        return { success: false, error: 'Invalid meeting ID format' };
      }

      return { success: true };
    } catch (error) {
      console.error('Meeting ID validation error:', error);
      return { success: false, error: 'ID validation error' };
    }
  }

  /**
   * Validate multiple meeting IDs
   * @param {Array} meetingIds - Array of meeting IDs to validate
   * @returns {Object} - Validation result
   */
  validateMeetingIds(meetingIds) {
    try {
      if (!Array.isArray(meetingIds) || meetingIds.length === 0) {
        return { success: false, error: 'Invalid meeting IDs array' };
      }

      const validIds = [];
      const invalidIds = [];

      meetingIds.forEach(id => {
        const validation = this.validateMeetingId(id);
        if (validation.success) {
          validIds.push(id);
        } else {
          invalidIds.push(id);
        }
      });

      if (invalidIds.length > 0) {
        return { 
          success: false, 
          error: `Invalid meeting IDs: ${invalidIds.join(', ')}` 
        };
      }

      return { success: true, validIds };
    } catch (error) {
      console.error('Multiple meeting IDs validation error:', error);
      return { success: false, error: 'IDs validation error' };
    }
  }

  /**
   * Validate meeting query parameters
   * @param {Object} queryParams - Query parameters to validate
   * @returns {Object} - Validation result
   */
  validateQueryParams(queryParams) {
    try {
      const sanitizedParams = DynamicValidationService.sanitizeInput(queryParams);

      // Validate pagination parameters if present
      if (sanitizedParams.page) {
        const page = parseInt(sanitizedParams.page);
        if (isNaN(page) || page < 1) {
          return { success: false, error: 'Invalid page number' };
        }
      }

      if (sanitizedParams.limit) {
        const limit = parseInt(sanitizedParams.limit);
        if (isNaN(limit) || limit < 1 || limit > 100) {
          return { success: false, error: 'Invalid limit (must be 1-100)' };
        }
      }

      return { success: true, data: sanitizedParams };
    } catch (error) {
      console.error('Query parameters validation error:', error);
      return { success: false, error: 'Query validation error' };
    }
  }
}

module.exports = new MeetingValidationService(); 