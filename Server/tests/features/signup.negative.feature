Feature: Negative Signup Scenarios
  As a user
  I want to see proper error handling for system-level failures
  So that the system provides clear feedback for registration failures

  @negative @signup @large_payload
  Scenario: Signup with oversized request body
    When I attempt to register with a request body larger than 1MB
    Then I should receive a "413" status code
    And the response should contain error message "Request body too large"

  @negative @signup @database_error
  Scenario: Signup when database is unavailable
    When the database connection is down
    And I attempt to register with email "new@test.com" password "password123" firstName "John" lastName "Doe" phoneNumber "1234567890"
    Then I should receive a "401" status code
    And the response should contain error message "An error occurred during user creation"
    And I restore the original configurations

  @negative @signup @bcrypt_error
  Scenario: Signup with bcrypt configuration error
    When the bcrypt salt rounds are not configured
    And I attempt to register with email "new@test.com" password "password123" firstName "John" lastName "Doe" phoneNumber "1234567890"
    Then I should receive a "401" status code
    And the response should contain error message "An error occurred during user creation"
    And I restore the original configurations 