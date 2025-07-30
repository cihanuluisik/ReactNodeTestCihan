const DynamicValidationService = require('./DynamicValidationService');

class AuthValidationService {
  // Validate login data using dynamic validation
  async validateLoginData(data) {
    return await DynamicValidationService.validateData('auth-login', data);
  }

  // Validate registration data using dynamic validation
  async validateRegisterData(data) {
    return await DynamicValidationService.validateData('auth-register', data);
  }

  // Validate admin registration data using dynamic validation
  async validateAdminRegisterData(data) {
    return await DynamicValidationService.validateData('auth-admin-register', data);
  }

  // Delegate email validation to DynamicValidationService
  async validateEmail(email) {
    const result = await DynamicValidationService.validateData('validate-email', { email });
    return !result.error;
  }

  // Delegate password validation to DynamicValidationService
  async validatePassword(password) {
    const result = await DynamicValidationService.validateData('validate-password', { password });
    return !result.error;
  }

  // Delegate password strength validation to DynamicValidationService
  async validatePasswordStrength(password) {
    const result = await DynamicValidationService.validateData('validate-password-strength', { password });
    return !result.error;
  }

  // Delegate token format validation to DynamicValidationService
  async validateTokenFormat(token) {
    const result = await DynamicValidationService.validateData('validate-token', { token });
    return !result.error;
  }

  // Delegate user role validation to DynamicValidationService
  async validateUserRole(role) {
    const result = await DynamicValidationService.validateData('validate-role', { role });
    return !result.error;
  }

  // Delegate phone number validation to DynamicValidationService
  async validatePhoneNumber(phoneNumber) {
    const result = await DynamicValidationService.validateData('validate-phone', { phoneNumber });
    return !result.error;
  }

  // Delegate cache management to DynamicValidationService
  clearCache() {
    DynamicValidationService.clearCache();
  }

  // Delegate body size validation to DynamicValidationService
  validateBodySize(body, maxSize) {
    return DynamicValidationService.validateBodySize(body, maxSize);
  }

  // Delegate input sanitization to DynamicValidationService
  sanitizeInput(input) {
    return DynamicValidationService.sanitizeInput(input);
  }
}

module.exports = new AuthValidationService(); 