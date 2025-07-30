const Validation = require('../model/schema/validation');
const Joi = require('joi');

class DynamicValidationService {
  // Cache for validation schemas to avoid repeated database queries
  constructor() {
    this.validationCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Get validation schema from database
  async getValidationSchema(validationName) {
    try {
      // Check cache first
      const cached = this.validationCache.get(validationName);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.schema;
      }

      // Fetch from database
      const validationDoc = await Validation.findOne({ 
        name: validationName, 
        deleted: false 
      });

      if (!validationDoc) {
        throw new Error(`Validation schema '${validationName}' not found`);
      }

      // Build Joi schema from database rules
      const schema = this.buildJoiSchema(validationDoc.validations);
      
      // Cache the schema
      this.validationCache.set(validationName, {
        schema,
        timestamp: Date.now()
      });

      return schema;
    } catch (error) {
      console.error(`Error fetching validation schema '${validationName}':`, error);
      throw error;
    }
  }

  // Build Joi schema from database validation rules
  buildJoiSchema(validations) {
    let schema = Joi.object();

    validations.forEach(validation => {
      const { formikType, require, min, max, value, message, match } = validation;
      
      let fieldSchema = this.getBaseSchema(formikType);

      // Apply validation rules
      if (require) {
        fieldSchema = fieldSchema.required().messages({
          'any.required': message || `${formikType} is required`
        });
      } else {
        // Make field optional but don't allow empty strings if min validation is set
        if (min !== undefined && min !== null && min !== false) {
          // If there's a minimum requirement, don't allow empty strings
          fieldSchema = fieldSchema.optional().allow(null);
        } else {
          // Otherwise allow empty strings and null values
          fieldSchema = fieldSchema.optional().allow('', null);
        }
      }

      if (min !== undefined && min !== null && min !== false) {
        if (typeof min === 'boolean') {
          // Boolean min means minimum length for strings
          // Use different minimums based on field type
          let minLength = 6; // default
          if (formikType === 'firstName' || formikType === 'lastName') {
            minLength = 2;
          } else if (formikType === 'phoneNumber') {
            minLength = 10;
          } else if (formikType === 'agenda') {
            minLength = 1; // Agenda should have minimum 1 character if provided
          }
          fieldSchema = fieldSchema.min(minLength).messages({
            'string.min': message || `${formikType} must be at least ${minLength} characters`,
            'number.min': message || `${formikType} must be at least ${minLength}`
          });
        } else {
          fieldSchema = fieldSchema.min(min).messages({
            'string.min': message || `${formikType} must be at least ${min} characters`,
            'number.min': message || `${formikType} must be at least ${min}`
          });
        }
      }

      if (max !== undefined && max !== null && max !== false) {
        if (typeof max === 'boolean') {
          // Boolean max means maximum length for strings
          // Use different maximums based on field type
          let maxLength = 50; // default
          if (formikType === 'phoneNumber') {
            maxLength = 10;
          }
          fieldSchema = fieldSchema.max(maxLength).messages({
            'string.max': message || `${formikType} must be less than ${maxLength} characters`,
            'number.max': message || `${formikType} must be at most ${maxLength}`
          });
        } else {
          fieldSchema = fieldSchema.max(max).messages({
            'string.max': message || `${formikType} must be less than ${max} characters`,
            'number.max': message || `${formikType} must be at most ${max}`
          });
        }
      }

      if (value !== undefined && value !== null) {
        if (match) {
          // Pattern matching
          fieldSchema = fieldSchema.pattern(new RegExp(value)).messages({
            'string.pattern.base': message || `${formikType} format is invalid`
          });
        } else {
          // Exact value matching
          fieldSchema = fieldSchema.valid(value).messages({
            'any.only': message || `${formikType} must be ${value}`
          });
        }
      }

      // Add field to schema
      schema = schema.keys({ [formikType]: fieldSchema });
    });

    return schema;
  }

  // Get base schema based on formik type
  getBaseSchema(formikType) {
    switch (formikType) {
      case 'username':
      case 'email':
        return Joi.string().email().messages({
          'string.email': 'Username must be a valid email address'
        });
      case 'password':
        return Joi.string();
      case 'firstName':
      case 'lastName':
        return Joi.string();
      case 'phoneNumber':
        return Joi.string().pattern(/^\d+$/);
      case 'token':
        return Joi.string().pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/).messages({
          'string.pattern.base': 'Token must be a valid JWT format'
        });
      case 'role':
        return Joi.string().valid('user', 'superAdmin').messages({
          'any.only': 'Role must be a valid user role'
        });
      case 'number':
      case 'duration':
        return Joi.number();
      case 'boolean':
        return Joi.boolean();
      case 'attendes':
      case 'attendesLead':
        return Joi.array().items(Joi.string()).messages({
          'array.base': `${formikType} must be an array`
        });
      case 'related':
      case 'createFor':
      case 'agenda':
        return Joi.string();
      default:
        return Joi.string();
    }
  }

  // Validate data using dynamic schema
  async validateData(validationName, data) {
    try {
      const schema = await this.getValidationSchema(validationName);
      const { error, value } = schema.validate(data);
      return { error, value };
    } catch (error) {
      console.error(`Validation error for '${validationName}':`, error);
      return { 
        error: { 
          details: [{ message: `Validation schema '${validationName}' not found` }] 
        }, 
        value: data 
      };
    }
  }

  // Sanitize input data
  sanitizeInput(data) {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (typeof data === 'string') {
      return data.trim().replace(/[<>]/g, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return data;
  }

  // Validate request body size
  validateBodySize(body, maxSize = 1024 * 1024) { // 1MB default
    if (body === null || body === undefined) {
      return { valid: true };
    }
    const bodySize = JSON.stringify(body).length;
    if (bodySize <= maxSize) {
      return { valid: true };
    } else {
      return { 
        valid: false, 
        error: 'Request body too large' 
      };
    }
  }

  // Clear cache (useful for testing or when validation rules change)
  clearCache() {
    this.validationCache.clear();
  }

  // Clear specific validation from cache
  clearValidationCache(validationName) {
    this.validationCache.delete(validationName);
  }
}

module.exports = new DynamicValidationService(); 