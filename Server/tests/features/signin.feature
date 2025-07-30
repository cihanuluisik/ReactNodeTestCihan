Feature: User Sign In
  As a user
  I want to sign in to the application
  So that I can access my account

  Background:
    Given the authentication system is running
    And there is an existing admin user with email "admin@gmail.com" and password "admin123"

  Scenario: Successful login with valid credentials
    When I send a POST request to "/api/user/login" with the following data:
      | username | password |
      | admin@gmail.com | admin123 |
    Then the response status should be 200
    And the response should contain a JWT token
    And the response should contain user data
    And the user role should be "superAdmin"

  Scenario: Validate JWT token and return user data
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a GET request to "/api/user/view/{userId}" with the JWT token
    Then the response status should be 200
    And the response should contain user data
    And the user email should be "admin@gmail.com"

  Scenario: Reject login with invalid credentials
    When I send a POST request to "/api/user/login" with the following data:
      | username | password |
      | admin@gmail.com | wrongpassword |
    Then the response status should be 401
    And the response should contain error message "Authentication failed, password does not match"

  Scenario: Reject login with non-existent user
    When I send a POST request to "/api/user/login" with the following data:
      | username | password |
      | nonexistent@example.com | admin123 |
    Then the response status should be 401
    And the response should contain error message "Authentication failed, invalid username" 