# Authentication UI Tests

This directory contains comprehensive UI tests for the authentication functionality, including login form, validation, and user state management. The tests follow the honeycomb testing model with a focus on API-first testing and major end-to-end user flows.

## Test Structure

```
__tests__/
├── SignIn.test.js                    # SignIn component tests
├── AuthLayout.test.js                # Authentication layout tests
├── Authentication.integration.test.js # End-to-end integration tests
└── AuthSchema.test.js                # Schema validation tests
```

## Test Coverage

### SignIn.test.js
- ✅ **Form Rendering** - Login form with all fields
- ✅ **Form Validation** - Required fields, email format validation
- ✅ **User Interactions** - Password visibility toggle, remember me checkbox
- ✅ **API Integration** - Login API calls with success/error handling
- ✅ **Loading States** - Form submission loading indicators
- ✅ **Error Handling** - Invalid credentials, network errors, server errors
- ✅ **Redux Integration** - User state management, image fetching
- ✅ **Navigation** - Redirect after successful login
- ✅ **Form Reset** - Form clearing after successful submission

### AuthLayout.test.js
- ✅ **Layout Rendering** - Authentication layout with children
- ✅ **Footer Component** - Footer display in auth layout
- ✅ **Illustration Background** - Background image rendering
- ✅ **Responsive Design** - Layout responsiveness
- ✅ **Error Handling** - Graceful handling of missing props

### Authentication.integration.test.js
- ✅ **Complete Login Flow** - End-to-end login process
- ✅ **Error Handling Flows** - Various error scenarios
- ✅ **Form Validation Flows** - Real-time validation
- ✅ **User Interaction Flows** - Password toggle, checkbox interactions
- ✅ **Loading State Flows** - Loading indicators and form disabling
- ✅ **Redux Integration Flows** - State management integration

### AuthSchema.test.js
- ✅ **Username Validation** - Email format validation, required field
- ✅ **Password Validation** - Required field validation
- ✅ **Complete Form Validation** - Full form validation scenarios
- ✅ **Edge Cases** - Null values, undefined, extra fields
- ✅ **Schema Structure** - Schema field definitions

## Running Tests

### Install Dependencies
```bash
cd Client
npm install
```

### Run All Authentication Tests
```bash
npm run test:auth
```

### Run Specific Test File
```bash
npm test -- SignIn.test.js
npm test -- AuthLayout.test.js
npm test -- Authentication.integration.test.js
npm test -- AuthSchema.test.js
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:ui
```

## Test Scenarios Covered

### Login Form Functionality
- **Form Rendering**: All form fields display correctly
- **Field Validation**: Email format, required fields
- **User Interactions**: Input changes, form submission
- **Password Visibility**: Toggle password show/hide
- **Remember Me**: Checkbox functionality
- **Form Reset**: Clear form after successful login

### API Integration
- **Successful Login**: Valid credentials, user state update, navigation
- **Invalid Credentials**: Error message display
- **Network Errors**: Graceful error handling
- **Server Errors**: HTTP error responses
- **Loading States**: Form disabling during API calls

### Validation Scenarios
- **Email Validation**: Valid/invalid email formats
- **Required Fields**: Missing username/password
- **Real-time Validation**: Field blur validation
- **Form Submission**: Pre-submission validation

### User Experience
- **Loading Indicators**: Spinner during API calls
- **Error Messages**: Clear error feedback
- **Success Feedback**: Success toast notifications
- **Form State**: Disabled/enabled states
- **Navigation**: Redirect after login

### Redux Integration
- **User State**: Setting user data in Redux store
- **Image Fetching**: Background image loading
- **State Persistence**: User data persistence

## Testing Principles Applied

### SOLID Principles
- **Single Responsibility**: Each test focuses on one functionality
- **Open/Closed**: Tests are extensible without modification
- **Liskov Substitution**: Mock implementations follow interfaces
- **Interface Segregation**: Tests use only needed interfaces
- **Dependency Inversion**: Tests depend on abstractions

### KISS, DRY, YAGNI
- **KISS**: Tests are simple and readable
- **DRY**: Common setup extracted into utilities
- **YAGNI**: Only testing what's needed

### Testing Best Practices
- **Arrange-Act-Assert**: Clear test structure
- **Descriptive Names**: Tests clearly describe functionality
- **Isolation**: Each test is independent
- **Mocking**: External dependencies properly mocked
- **Error Scenarios**: Both success and failure cases tested

## Mock Strategy

### API Mocks
- Login API calls mocked with Jest
- Success and error responses defined
- Network error scenarios tested

### Redux Mocks
- Store mocked using `redux-mock-store`
- Actions mocked to return expected types
- State pre-populated for different scenarios

### Router Mocks
- `useNavigate` mocked for navigation testing
- Navigation calls verified in tests

### Local Storage Mocks
- User data mocked for authentication tests
- Different user roles tested

## Security Testing

### Authentication Security
- **Password Visibility**: Toggle functionality tested
- **Form Validation**: Prevents invalid submissions
- **Error Handling**: Secure error messages
- **Session Management**: Remember me functionality

### Input Validation
- **Email Format**: Strict email validation
- **Required Fields**: Prevents empty submissions
- **Real-time Validation**: Immediate feedback

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Authentication Tests
  run: |
    cd Client
    npm install
    npm run test:auth
```

## Coverage Goals

- **Component Coverage**: 100% of auth components tested
- **User Interaction Coverage**: All user interactions tested
- **API Integration Coverage**: All API calls tested
- **Error Handling Coverage**: All error scenarios tested
- **Validation Coverage**: All validation rules tested

## Maintenance

### Adding New Tests
1. Follow existing naming convention
2. Use shared test utilities
3. Add descriptive test names
4. Include both success and error scenarios

### Updating Tests
1. Update mocks when API changes
2. Update validation when schema changes
3. Update user roles when permission system changes

### Debugging Tests
1. Use `console.log` in tests for debugging
2. Check mock implementations
3. Verify test data matches expected format
4. Ensure all dependencies are properly mocked

## Common Test Patterns

### Form Testing Pattern
```javascript
test('submits form with valid data', async () => {
  // Arrange
  renderComponent();
  
  // Act
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);
  
  // Assert
  await waitFor(() => {
    expect(apiCall).toHaveBeenCalledWith(expectedData);
  });
});
```

### Error Handling Pattern
```javascript
test('handles API error gracefully', async () => {
  // Arrange
  apiMock.mockRejectedValue(new Error('Network error'));
  
  // Act
  renderComponent();
  fireEvent.click(submitButton);
  
  // Assert
  await waitFor(() => {
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

### Validation Pattern
```javascript
test('validates required fields', async () => {
  // Arrange
  renderComponent();
  
  // Act
  fireEvent.click(submitButton);
  
  // Assert
  await waitFor(() => {
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });
});
``` 