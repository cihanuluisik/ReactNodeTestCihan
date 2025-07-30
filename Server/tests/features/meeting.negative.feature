Feature: Meeting Management Negative Tests
  As a user
  I want to ensure proper error handling for meeting operations
  So that the system is secure and robust

  Background:
    Given the authentication system is running
    And there is an existing admin user with email "admin@gmail.com" and password "admin123"

  Scenario: Reject meeting creation with invalid attendee IDs
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with invalid attendee IDs:
      | agenda | attendes | dateTime |
      | Test Meeting | invalid-id-1,invalid-id-2 | 2024-01-15T10:00:00Z |
    Then the response status should be 201
    And the response should contain meeting data

  Scenario: Reject meeting creation with oversized request body
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with oversized data
    Then the response status should be 413
    And the response should contain error message about request body too large

  Scenario: Reject meeting creation with XSS attempt
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with XSS data:
      | agenda | dateTime |
      | <script>alert("xss")</script>Test Meeting | 2024-01-15T10:00:00Z |
    Then the response status should be 201
    And the response should contain sanitized data without script tags

  Scenario: Reject meeting retrieval with invalid ID
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a GET request to "/api/meeting/view/invalid-id" with the JWT token
    Then the response status should be 400
    And the response should contain error message about invalid meeting ID format

  Scenario: Reject meeting retrieval of non-existent meeting
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a GET request to "/api/meeting/view/{nonExistentId}" with the JWT token
    Then the response status should be 404
    And the response should contain error message "Meeting not found"

  Scenario: Reject meeting update with invalid ID
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a PUT request to "/api/meeting/edit/invalid-id" with update data:
      | agenda |
      | Updated Agenda |
    Then the response status should be 400
    And the response should contain error message about invalid meeting ID format

  Scenario: Reject meeting update of non-existent meeting
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a PUT request to "/api/meeting/edit/{nonExistentId}" with update data:
      | agenda |
      | Updated Agenda |
    Then the response status should be 404
    And the response should contain error message "Meeting not found or access denied"

  Scenario: Reject meeting deletion with invalid ID
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a DELETE request to "/api/meeting/delete/invalid-id" with the JWT token
    Then the response status should be 400
    And the response should contain error message about invalid meeting ID format

  Scenario: Reject meeting deletion of non-existent meeting
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a DELETE request to "/api/meeting/delete/{nonExistentId}" with the JWT token
    Then the response status should be 404
    And the response should contain error message "Meeting not found or access denied"

  Scenario: Reject multiple meeting deletion with invalid IDs
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a DELETE request to "/api/meeting/deleteMany" with invalid meeting IDs
    Then the response status should be 400
    And the response should contain error message about invalid meeting IDs

  Scenario: Reject meeting operations without proper authorization
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And there is a meeting created by another user
    When I send a GET request to "/api/meeting/view/{otherUserMeetingId}" with the JWT token
    Then the response status should be 404
    And the response should contain error message "Meeting not found" 