Feature: Backend TTS API - Text-to-Speech Endpoint

  Scenario: API returns MP3 audio for valid request
    When I send a POST request to "/api/tts" with valid text
    Then the response status is 200
    And the response content-type is "audio/mpeg"
    And the response body contains binary data

  Scenario: API validates required text field
    When I send a POST request without text
    Then the response status is 400
    And the response contains error message "Missing or invalid text field"

  Scenario: API rejects text exceeding max length
    When I send a POST request with text longer than 10000 characters
    Then the response status is 400
    And the response contains error message "Text exceeds maximum length"

  Scenario: API rejects invalid audio format
    When I send a POST request with format "invalid"
    Then the response status is 400
    And the response contains error message "Invalid format"

  Scenario: API enforces rate limiting
    When I send 35 requests within 60 seconds
    Then at least one request fails with status 429
    And the response header includes rate limit info

  Scenario: API requires authentication
    When I send a POST request without Authorization header
    Then the response status is 401
    And the response contains error message "Missing Authorization header"

  Scenario: API returns 503 when TTS backend is disabled
    Given RETROSPECTIVE_TTS_BACKEND is set to false
    When I send a POST request with valid data
    Then the response status is 503
    And the response contains error message "TTS backend is not enabled"

  Scenario: Health check endpoint returns status
    When I send a GET request to "/api/health"
    Then the response status is 200
    And the response contains field "status" with value "ok"
    And the response contains field "ttsBackendEnabled"
    And the response contains field "ttsProvider"
