Feature: User login
  As a registered user
  I want to sign in to the application
  So that I can access the product inventory

  Background:
    Given I am on the login page

  Scenario: Successful login redirects to the inventory page
    When I sign in as "standard" user
    Then I should be on the inventory page
    And the inventory list should be visible

  Scenario: Missing password gives an error message
    When I sign in with username and empty password as "standard" user
    Then I should see error "Epic sadface: Password is required"

  Scenario: Missing username gives an error message
    When I sign in with empty username and password as "standard" user
    Then I should see error "Epic sadface: Username is required"

  Scenario: Incorrect credentials gives an error message
    When I sign in with incorrect password as "standard" user
    Then I should see error "Epic sadface: Username and password do not match any user in this service"

  Scenario: Error message can be cleared
    When I sign in with incorrect password as "standard" user
    And I click the error dismiss button
    Then the error dismiss button should not be visible

  Scenario: Locked out user gets an error message
    When I sign in as "locked" user
    Then I should see error "Epic sadface: Sorry, this user has been locked out."

  Scenario: Login can be completed using keyboard navigation only
    When I sign in using keyboard as "standard" user
    Then I should be on the inventory page
    And the inventory list should be visible

  Scenario: Delayed login still works
    When I sign in using keyboard as "slow" user
    Then I should be on the inventory page
    And the inventory list should be visible
