# Meeting CRUD UI Tests

This directory contains comprehensive UI tests for the Meeting CRUD feature components. The tests follow the honeycomb testing model with a focus on API-first testing and major end-to-end user flows.

## Test Structure

```
__tests__/
├── MeetingList.test.js              # Meeting list component tests
├── MeetingView.test.js              # Meeting view component tests
├── MeetingCRUD.integration.test.js  # End-to-end integration tests
└── components/
    ├── AddMeeting.test.js           # Add meeting form tests
    └── MeetingAdvanceSearch.test.js # Advanced search tests
```

## Test Coverage

### MeetingList.test.js
- ✅ Component rendering with data
- ✅ Add meeting modal interactions
- ✅ Advanced search modal interactions
- ✅ Meeting deletion (single and bulk)
- ✅ Navigation to meeting details
- ✅ Loading states
- ✅ Search and filtering
- ✅ Sorting functionality
- ✅ Pagination

### AddMeeting.test.js
- ✅ Form rendering with all fields
- ✅ Form validation (required fields, email format)
- ✅ Form submission with valid data
- ✅ Error handling for API failures
- ✅ Contact/Lead selection modals
- ✅ Form reset and cancellation
- ✅ Loading states during submission
- ✅ Pre-filling form for editing

### MeetingView.test.js
- ✅ Meeting details display
- ✅ Meeting deletion with confirmation
- ✅ PDF generation functionality
- ✅ Loading states
- ✅ Navigation (back button)
- ✅ Date/time formatting
- ✅ Attendees display
- ✅ Permission-based UI elements
- ✅ Error handling

### MeetingAdvanceSearch.test.js
- ✅ Search form rendering
- ✅ Email validation
- ✅ Date range search
- ✅ Time range search
- ✅ Form submission with various criteria
- ✅ Form reset functionality
- ✅ Modal interactions
- ✅ Loading states

### MeetingCRUD.integration.test.js
- ✅ Complete meeting creation workflow
- ✅ Search and filter workflows
- ✅ View and edit workflows
- ✅ Deletion workflows
- ✅ Bulk operations
- ✅ PDF generation flow
- ✅ Error handling flows
- ✅ Permission-based access flows

## Running Tests

### Install Dependencies
```bash
cd Client
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:ui
```

### Run Only Meeting Tests
```bash
npm run test:meeting
```

### Run Specific Test File
```bash
npm test -- MeetingList.test.js
```

## Test Utilities

The tests use a shared test utilities file located at `src/__tests__/utils/test-utils.js` which provides:

- `renderWithProviders()` - Custom render function with all necessary providers
- `mockApiResponses` - Pre-defined API response mocks
- `createMockMeeting()` - Helper to create mock meeting data
- `createMockUser()` - Helper to create mock user data
- `setupCommonMocks()` - Setup common mocks for tests
- `cleanupMocks()` - Clean up mocks after tests

## Testing Principles Applied

### SOLID Principles
- **Single Responsibility**: Each test focuses on one specific functionality
- **Open/Closed**: Tests are extensible without modification
- **Liskov Substitution**: Mock implementations follow the same interface
- **Interface Segregation**: Tests use only the interfaces they need
- **Dependency Inversion**: Tests depend on abstractions, not concretions

### KISS, DRY, YAGNI
- **KISS**: Tests are simple and readable
- **DRY**: Common setup is extracted into utility functions
- **YAGNI**: Only testing what's actually needed

### Testing Best Practices
- **Arrange-Act-Assert**: Clear test structure
- **Descriptive test names**: Tests clearly describe what they're testing
- **Isolation**: Each test is independent
- **Mocking**: External dependencies are properly mocked
- **Error scenarios**: Both success and failure cases are tested

## Mock Strategy

### API Mocks
- All API calls are mocked using Jest
- Mock responses are defined in `mockApiResponses`
- Error scenarios are tested with rejected promises

### Redux Mocks
- Store is mocked using `redux-mock-store`
- Actions are mocked to return expected types
- State is pre-populated for different scenarios

### Router Mocks
- `useNavigate`, `useParams`, `useLocation` are mocked
- Navigation calls are verified in tests

### Local Storage Mocks
- User data is mocked for authentication/authorization tests
- Different permission levels are tested

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run UI Tests
  run: |
    cd Client
    npm install
    npm run test:coverage
```

## Coverage Goals

- **Component Coverage**: 100% of meeting components tested
- **User Interaction Coverage**: All user interactions tested
- **API Integration Coverage**: All API calls tested
- **Error Handling Coverage**: All error scenarios tested
- **Permission Coverage**: All permission levels tested

## Maintenance

### Adding New Tests
1. Follow the existing naming convention
2. Use the shared test utilities
3. Add descriptive test names
4. Include both success and error scenarios

### Updating Tests
1. Update mocks when API changes
2. Update test data when schema changes
3. Update permissions when role system changes

### Debugging Tests
1. Use `console.log` in tests for debugging
2. Check mock implementations
3. Verify test data matches expected format
4. Ensure all dependencies are properly mocked 