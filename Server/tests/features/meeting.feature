Feature: Meeting Management
  As a user
  I want to manage meetings
  So that I can schedule and organize business meetings

  Background:
    Given the authentication system is running
    And there is an existing admin user with email "admin@gmail.com" and password "admin123"
    And there are test contacts and leads available

  Scenario: Create meeting successfully with valid data
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with the following meeting data:
      | agenda | location | dateTime | duration | createFor |
      | Test Meeting Agenda | Conference Room A | 2024-01-15T10:00:00Z | 30 | |
    Then the response status should be 201
    And the response should contain meeting data
    And the meeting should have agenda "Test Meeting Agenda"
    And the meeting should have location "Conference Room A"
    And the meeting should be created by the authenticated user

  Scenario: Create meeting with attendees
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with attendees data
    Then the response status should be 201
    And the response should contain meeting data
    And the meeting should have attendees populated
    And the meeting should have lead attendees populated

  Scenario: Create meeting with duration field
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with the following meeting data:
      | agenda | location | dateTime | duration | createFor |
      | Duration Test Meeting | Conference Room B | 2024-01-15T11:00:00Z | 120 | Client Demo |
    Then the response status should be 201
    And the response should contain meeting data
    And the meeting should have agenda "Duration Test Meeting"
    And the meeting should have duration 120
    And the meeting should have createFor "Client Demo"

  Scenario: Create meeting with minimal required fields
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with the following meeting data:
      | agenda | location | dateTime | duration | createFor |
      | Minimal Meeting | | 2024-01-15T12:00:00Z | 30 | |
    Then the response status should be 201
    And the response should contain meeting data
    And the meeting should have agenda "Minimal Meeting"
    And the meeting should have default duration 30

  Scenario: Reject meeting creation with invalid duration
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with the following meeting data:
      | agenda | location | dateTime | duration | createFor |
      | Invalid Duration Meeting | | 2024-01-15T13:00:00Z | 10 | |
    Then the response status should be 400
    And the response should contain error message about invalid duration

  Scenario: Reject meeting creation with duration above maximum
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with the following meeting data:
      | agenda | location | dateTime | duration | createFor |
      | Long Duration Meeting | | 2024-01-15T14:00:00Z | 500 | |
    Then the response status should be 400
    And the response should contain error message about invalid duration

  Scenario: Create meeting with special characters in agenda
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to "/api/meeting/add" with the following meeting data:
      | agenda | location | dateTime | duration | createFor |
      | Special Chars Test | | 2024-01-15T15:00:00Z | 30 | |
    Then the response status should be 201
    And the response should contain meeting data
    And the meeting should have agenda "Special Chars Test"

  Scenario: Reject meeting creation without authentication
    When I send a POST request to "/api/meeting/add" without authentication with the following data:
      | agenda | location | dateTime | duration | createFor |
      | Test Meeting | | 2024-01-15T10:00:00Z | 30 | |
    Then the response status should be 401

  Scenario: Reject meeting creation with missing required fields
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I send a POST request to meeting endpoint "/api/meeting/add" with the following data:
      | agenda | location | dateTime | duration | createFor |
      | | Conference Room A | 2024-01-15T10:00:00Z | 30 | |
    Then the response status should be 400
    And the response should contain error message about missing agenda

  Scenario: Get all meetings for superAdmin
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And there are existing meetings in the system
    When I send a GET request to "/api/meeting/index" with the JWT token
    Then the response status should be 200
    And the response should contain an array of meetings
    And all meetings should be visible to superAdmin

  Scenario: Get single meeting by ID
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And there is an existing meeting with agenda "Test Meeting"
    When I send a GET request to "/api/meeting/view/{meetingId}" with the JWT token
    Then the response status should be 200
    And the response should contain meeting data
    And the meeting should have agenda "Test Meeting"

  Scenario: Update meeting successfully
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And there is an existing meeting with agenda "Original Agenda"
    When I send a PUT request to "/api/meeting/edit/{meetingId}" with the following update data:
      | agenda | location | dateTime | duration | createFor |
      | Updated Agenda | Updated Location | | | |
    Then the response status should be 200
    And the response should contain updated meeting data
    And the meeting should have agenda "Updated Agenda"
    And the meeting should have location "Updated Location"

  Scenario: Delete meeting successfully
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And there is an existing meeting with agenda "Meeting to Delete"
    When I send a DELETE request to "/api/meeting/delete/{meetingId}" with the JWT token
    Then the response status should be 200
    And the response should contain success message
    And the meeting should be soft deleted

  Scenario: Delete multiple meetings
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And there are multiple existing meetings
    When I send a DELETE request to "/api/meeting/deleteMany" with multiple meeting IDs
    Then the response status should be 200
    And the response should contain success message about multiple deletions 