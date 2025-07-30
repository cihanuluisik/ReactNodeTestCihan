Feature: Meeting Management End-to-End Workflows
  As a user of the meeting management system
  I want to perform complete meeting workflows
  So that I can effectively manage my business meetings

  Background:
    Given the authentication system is running
    And there is an existing admin user with email "admin@gmail.com" and password "admin123"
    And there is an existing regular user with email "user@gmail.com" and password "user123"
    And there are test contacts and leads available

  @e2e @workflow @meeting-lifecycle
  Scenario: Complete meeting lifecycle - Create, View, Update, Delete
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a new meeting with the following details:
      | agenda | location | dateTime | duration | createFor |
      | Complete Lifecycle Meeting | Conference Room A | 2024-01-15T10:00:00Z | 60 | Client Demo |
    Then the meeting should be created successfully
    And I should see the meeting in my meetings list
    When I view the meeting details
    Then I should see all the meeting information correctly
    When I update the meeting with the following changes:
      | agenda | location | duration |
      | Updated Lifecycle Meeting | Virtual Meeting | 90 |
    Then the meeting should be updated successfully
    And I should see the updated information
    When I delete the meeting
    Then the meeting should be deleted successfully
    And I should not see the meeting in my meetings list

  @e2e @workflow @meeting-with-attendees
  Scenario: Meeting with attendees workflow
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a meeting with attendees:
      | agenda | dateTime | duration | location |
      | Team Meeting with Attendees | 2024-01-15T14:00:00Z | 45 | Conference Room B |
    And I add the following attendees:
      | type | name | email |
      | contact | John Doe | john.doe@example.com |
      | lead | Jane Smith | jane.smith@example.com |
    Then the meeting should be created with attendees
    And I should see the attendees in the meeting details
    When I update the meeting attendees
    Then the attendees should be updated correctly

  @e2e @workflow @bulk-operations
  Scenario: Bulk meeting operations
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create multiple meetings:
      | agenda | dateTime | duration |
      | Bulk Meeting 1 | 2024-01-15T09:00:00Z | 30 |
      | Bulk Meeting 2 | 2024-01-15T10:00:00Z | 45 |
      | Bulk Meeting 3 | 2024-01-15T11:00:00Z | 60 |
    Then all meetings should be created successfully
    And I should see all meetings in my meetings list
    When I select multiple meetings for deletion
    Then the selected meetings should be deleted successfully
    And I should not see the deleted meetings in my list

  @e2e @workflow @role-based-access
  Scenario: Role-based meeting access
    Given I have logged in successfully with email "user@gmail.com" and password "user123"
    When I create a meeting as a regular user:
      | agenda | dateTime | duration |
      | User Meeting | 2024-01-15T13:00:00Z | 30 |
    Then the meeting should be created successfully
    And I should only see my own meetings
    When I try to access a meeting created by another user
    Then I should not be able to view that meeting
    And I should receive an appropriate error message

  @e2e @workflow @meeting-scheduling
  Scenario: Meeting scheduling and time management
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a meeting with specific scheduling:
      | agenda | dateTime | duration | location |
      | Scheduled Meeting | 2024-01-15T15:00:00Z | 120 | Conference Room C |
    Then the meeting should be scheduled correctly
    And the duration should be set to 120 minutes
    When I update the meeting time to "2024-01-15T16:00:00Z"
    Then the meeting should be rescheduled successfully
    And the new time should be reflected in the meeting details

  @e2e @workflow @meeting-validation
  Scenario: Meeting validation and error handling
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I try to create a meeting with invalid data:
      | agenda | dateTime | duration |
      | | 2024-01-15T10:00:00Z | 10 |
    Then I should receive validation errors
    And the meeting should not be created
    When I try to create a meeting with valid data:
      | agenda | dateTime | duration |
      | Valid Meeting | 2024-01-15T10:00:00Z | 30 |
    Then the meeting should be created successfully

  @e2e @workflow @meeting-search-filter
  Scenario: Meeting search and filtering
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And I have multiple meetings with different agendas:
      | agenda | dateTime |
      | Search Test Meeting 1 | 2024-01-15T09:00:00Z |
      | Search Test Meeting 2 | 2024-01-15T10:00:00Z |
      | Different Meeting | 2024-01-15T11:00:00Z |
    When I search for meetings with "Search Test"
    Then I should see only the meetings containing "Search Test"
    When I clear the search
    Then I should see all my meetings again

  @e2e @workflow @meeting-notes
  Scenario: Meeting notes and additional information
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a meeting with notes:
      | agenda | dateTime | notes |
      | Meeting with Notes | 2024-01-15T14:00:00Z | Important discussion points and action items |
    Then the meeting should be created with notes
    And I should see the notes in the meeting details
    When I update the meeting notes
    Then the notes should be updated correctly

  @e2e @workflow @meeting-location
  Scenario: Meeting location management
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a meeting with different location types:
      | agenda | dateTime | location | type |
      | In-Person Meeting | 2024-01-15T10:00:00Z | Conference Room A | physical |
      | Virtual Meeting | 2024-01-15T11:00:00Z | Zoom Meeting | virtual |
      | Hybrid Meeting | 2024-01-15T12:00:00Z | Conference Room B + Teams | hybrid |
    Then all meetings should be created with correct locations
    And I should be able to distinguish between location types

  @e2e @workflow @meeting-duration
  Scenario: Meeting duration management
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create meetings with different durations:
      | agenda | dateTime | duration | type |
      | Short Meeting | 2024-01-15T09:00:00Z | 15 | quick |
      | Standard Meeting | 2024-01-15T10:00:00Z | 30 | standard |
      | Long Meeting | 2024-01-15T11:00:00Z | 120 | extended |
    Then all meetings should be created with correct durations
    And the duration should be properly validated

  @e2e @workflow @meeting-recurring
  Scenario: Recurring meeting management
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a recurring meeting:
      | agenda | dateTime | duration | recurrence |
      | Weekly Standup | 2024-01-15T09:00:00Z | 30 | weekly |
    Then the meeting should be created successfully
    And I should see the recurring pattern in the meeting details
    When I update the recurring meeting
    Then the changes should apply to all future occurrences

  @e2e @workflow @meeting-reminders
  Scenario: Meeting reminders and notifications
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a meeting with reminders:
      | agenda | dateTime | reminder | type |
      | Meeting with Reminder | 2024-01-15T15:00:00Z | 15 minutes | notification |
    Then the meeting should be created with reminder settings
    And I should receive appropriate notifications

  @e2e @workflow @meeting-export
  Scenario: Meeting data export and reporting
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And I have multiple meetings in the system
    When I export my meetings data
    Then I should receive a properly formatted export
    And the export should contain all my meeting information
    When I filter meetings by date range and export
    Then I should receive only the filtered meetings in the export

  @e2e @workflow @meeting-import
  Scenario: Meeting data import
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I import meeting data from a valid file
    Then the meetings should be imported successfully
    And I should see the imported meetings in my list
    When I try to import invalid meeting data
    Then I should receive appropriate error messages
    And invalid meetings should not be imported

  @e2e @workflow @meeting-collaboration
  Scenario: Meeting collaboration and sharing
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a collaborative meeting:
      | agenda | dateTime | collaboration | type |
      | Collaborative Meeting | 2024-01-15T16:00:00Z | shared | team |
    Then the meeting should be created with collaboration settings
    And other team members should be able to access the meeting
    When I update the collaboration settings
    Then the changes should be reflected for all participants

  @e2e @workflow @meeting-templates
  Scenario: Meeting templates and quick creation
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    When I create a meeting from a template:
      | template | name | customization |
      | Standup | Daily Standup | duration: 15 minutes |
    Then the meeting should be created with template defaults
    And I should be able to customize the template values
    When I save the current meeting as a template
    Then the template should be saved for future use

  @e2e @workflow @meeting-analytics
  Scenario: Meeting analytics and insights
    Given I have logged in successfully with email "admin@gmail.com" and password "admin123"
    And I have multiple meetings with various durations and types
    When I view meeting analytics
    Then I should see insights about my meeting patterns
    And I should see statistics about meeting duration and frequency
    When I filter analytics by date range
    Then I should see analytics for the selected period only 