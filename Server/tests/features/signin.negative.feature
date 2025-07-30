Feature: Negative Signin Scenarios
  As a user
  I want to see proper error handling for system-level failures
  So that the system provides clear feedback for authentication failures

  Background:
    Given there is an existing admin user with email "admin@test.com" and password "admin123"

  @negative @signin @large_payload
  Scenario: Signin with oversized request body
    When I attempt to login with a request body larger than 1MB
    Then I should receive a "413" status code
    And the response should contain error message "Request body too large"

  @negative @signin @database_error
  Scenario: Signin when database is unavailable
    When the database connection is down
    And I attempt to login with email "admin@test.com" and password "admin123"
    Then I should receive a "401" status code
    And the response should contain error message "An error occurred during login"
    And I restore the original configurations

  @negative @signin @jwt_error
  Scenario: Signin with JWT configuration error
    When the JWT secret is not configured
    And I attempt to login with email "admin@test.com" and password "admin123"
    Then I should receive a "401" status code
    And the response should contain error message "An error occurred during login"
    And I restore the original configurations 