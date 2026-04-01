Feature: RetrospectiveSpeech Component - Text-to-Speech Controls

  Background:
    Given I am on the demo page
    And the sample retrospective notes are displayed

  Scenario: User can play retrospective notes
    When I click the "Play" button
    Then the button text changes to "Pause"
    And the status shows "Playing"

  Scenario: User can pause and resume playback
    Given playback is active
    When I click the "Pause" button
    Then the button text changes to "Resume"
    And the status shows "Paused"
    When I click the "Resume" button
    Then the button text changes to "Pause"
    And the status shows "Playing"

  Scenario: User can stop playback
    Given playback is active
    When I click the "Stop" button
    Then the status shows "Stopped"
    And the time resets to "00:00"

  Scenario: User can select a different voice
    When I click on the voice dropdown
    Then the dropdown opens
    And I see at least one voice option
    When I select the second voice
    Then the voice dropdown displays the new selection

  Scenario: User can adjust speech speed
    When I move the speed slider to 1.5x
    Then the speed label shows "1.5"
    And the slider value reflects the change

  Scenario: User can adjust speech pitch
    When I move the pitch slider to 1.5
    Then the pitch label shows "1.5"
    And the slider value reflects the change

  Scenario: User can download audio
    When I click the "Download" button
    Then a file download is initiated
    Or the download request is sent to the server

  Scenario: User can use keyboard shortcuts
    When I press the Space key
    Then playback starts or pauses
    When I press the "S" key
    Then playback stops
    And the status shows "Stopped"

  Scenario: Component is accessible with keyboard navigation
    When I press Tab to focus on controls
    Then each button receives focus
    And buttons are keyboard-clickable
    And the component has ARIA labels

  Scenario: Component is mobile responsive
    Given I am viewing on a mobile device (375px width)
    When I view the component
    Then the layout stacks vertically
    And buttons are full-width
    And all controls remain functional

  Scenario: User preferences are persisted
    When I select a voice and adjust speed and pitch
    And I refresh the page
    Then my previous selections are restored
