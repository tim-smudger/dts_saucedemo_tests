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

  # The field error icons look clickable but are not interactive. These scenarios
  # assert the intuitive behaviour — that clicking an icon dismisses its error — and
  # are tagged @fail because the app does not support it. playwright-bdd maps @fail to
  # Playwright's test.fail(), so the build stays green while the behaviour is missing
  # and will start failing (alerting us) if the app is ever changed to support it.
  # Only the error banner's dismiss (X) button actually clears the error.
  @fail
  Scenario: Clicking the username error icon dismisses the error
    When I sign in with incorrect password as "standard" user
    And I click the username error icon
    Then the username error icon should not be visible

  @fail
  Scenario: Clicking the password error icon dismisses the error
    When I sign in with incorrect password as "standard" user
    And I click the password error icon
    Then the password error icon should not be visible

  Scenario: The dismiss button clears the field error icons
    When I sign in with incorrect password as "standard" user
    Then the username error icon should be visible
    And the password error icon should be visible
    When I click the error dismiss button
    Then the username error icon should not be visible
    And the password error icon should not be visible

  Scenario: Logout returns to the login page
    Given I sign in as "standard" user
    And the inventory list should be visible
    When I logout via the menu
    Then I should be on the login page
