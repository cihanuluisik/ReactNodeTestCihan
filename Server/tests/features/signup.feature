Feature: User Sign Up
  As a new user
  I want to create an account
  So that I can access the application

  Background:
    Given the authentication system is running

  Scenario: Successful user registration
    When I send a POST request to "/api/user/register" with the following data:
      | username | password | firstName | lastName | phoneNumber |
      | testuser@example.com | password123 | John | Doe | 1234567890 |
    Then the response status should be 200
    And the response should contain message "User created successfully"

  Scenario: Successful admin registration
    When I send a POST request to "/api/user/admin-register" with the following data:
      | username | password | firstName | lastName | phoneNumber | role |
      | newadmin@example.com | adminpassword123 | Admin | User | 1234567890 | superAdmin |
    Then the response status should be 200
    And the response should contain message "Admin created successfully"

  Scenario: Registration and login flow
    Given I have registered a new user with email "flowtest@example.com"
    When I login with the registered user credentials
    Then the response status should be 200
    And the response should contain a JWT token
    And the response should contain user data
    And the user role should be "user"

  Scenario: Admin registration and login flow
    Given I have registered a new admin with email "adminflow@example.com"
    When I login with the registered admin credentials
    Then the response status should be 200
    And the response should contain a JWT token
    And the response should contain user data
    And the user role should be "superAdmin"

  Scenario: Reject registration with existing email
    Given I have registered a new user with email "existing@test.com"
    When I send a POST request to "/api/user/register" with the following data:
      | username | password | firstName | lastName | phoneNumber |
      | existing@test.com | password123 | John | Doe | 1234567890 |
    Then the response status should be 401
    And the response should contain message "User already exists, please try another email" 