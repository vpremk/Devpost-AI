import { test, expect } from '@playwright/test';

test.describe('RetrospectiveSpeech Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for component to load
    await page.waitForSelector('[role="region"][aria-label="Text-to-speech controls"]', { timeout: 5000 });
  });

  test('displays sample retrospective notes', async ({ page }) => {
    const textDisplay = page.locator('.text-display p');
    await expect(textDisplay).toBeVisible();
    const text = await textDisplay.textContent();
    expect(text).toContain('Interview Retrospective');
  });

  test('user can play retrospective notes', async ({ page }) => {
    const playButton = page.locator('button:has-text("Play")').first();
    await playButton.click();

    // Check button text changes
    const pauseButton = page.locator('button:has-text("Pause")').first();
    await expect(pauseButton).toBeVisible({ timeout: 2000 });

    // Check status updates
    const status = page.locator('.status');
    await expect(status).toContainText('Playing');
  });

  test('user can pause and resume playback', async ({ page }) => {
    const playButton = page.locator('button:has-text("Play")').first();
    await playButton.click();

    // Wait for playback to start
    const pauseButton = page.locator('button:has-text("Pause")').first();
    await expect(pauseButton).toBeVisible({ timeout: 2000 });

    // Pause
    await pauseButton.click();
    const resumeButton = page.locator('button:has-text("Resume")').first();
    await expect(resumeButton).toBeVisible({ timeout: 1000 });
    await expect(page.locator('.status')).toContainText('Paused');

    // Resume
    await resumeButton.click();
    await expect(page.locator('.status')).toContainText('Playing');
  });

  test('user can stop playback', async ({ page }) => {
    const playButton = page.locator('button:has-text("Play")').first();
    await playButton.click();

    const stopButton = page.locator('button:has-text("Stop")');
    await expect(stopButton).toBeEnabled({ timeout: 2000 });
    await stopButton.click();

    await expect(page.locator('.status')).toContainText('Stopped');
    const timeDisplay = page.locator('.status .time');
    await expect(timeDisplay).toContainText('00:00');
  });

  test('user can select a different voice', async ({ page }) => {
    const voiceSelect = page.locator('#voice-select');
    await voiceSelect.click();

    const options = page.locator('#voice-select option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    if (optionCount > 1) {
      // Select second option
      await voiceSelect.selectOption({ index: 1 });
      const selectedValue = await voiceSelect.inputValue();
      expect(selectedValue).toBe('1');
    }
  });

  test('user can adjust speech speed', async ({ page }) => {
    const speedSlider = page.locator('#rate-slider');
    await speedSlider.fill('1.5');

    const speedLabel = page.locator('label:has-text("Speed")');
    await expect(speedLabel).toContainText('1.5');
  });

  test('user can adjust speech pitch', async ({ page }) => {
    const pitchSlider = page.locator('#pitch-slider');
    await pitchSlider.fill('1.5');

    const pitchLabel = page.locator('label:has-text("Pitch")');
    await expect(pitchLabel).toContainText('1.5');
  });

  test('user can click download button', async ({ page }) => {
    const downloadButton = page.locator('button:has-text("Download")');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
  });

  test('keyboard shortcut Space toggles play/pause', async ({ page }) => {
    const textDisplay = page.locator('.text-display');
    await textDisplay.focus();

    // Press Space to play
    await page.keyboard.press('Space');
    const pauseButton = page.locator('button:has-text("Pause")').first();
    await expect(pauseButton).toBeVisible({ timeout: 2000 });

    // Press Space to pause
    await page.keyboard.press('Space');
    const resumeButton = page.locator('button:has-text("Resume")').first();
    await expect(resumeButton).toBeVisible({ timeout: 1000 });
  });

  test('keyboard shortcut S stops playback', async ({ page }) => {
    const playButton = page.locator('button:has-text("Play")').first();
    await playButton.click();

    await page.waitForTimeout(500); // Let playback start

    const textDisplay = page.locator('.text-display');
    await textDisplay.focus();
    await page.keyboard.press('s');

    await expect(page.locator('.status')).toContainText('Stopped');
  });

  test('component has ARIA labels for accessibility', async ({ page }) => {
    const playButton = page.locator('button:has-text("Play")').first();
    const ariaLabel = await playButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    const stopButton = page.locator('button:has-text("Stop")');
    const stopAriaLabel = await stopButton.getAttribute('aria-label');
    expect(stopAriaLabel).toBeTruthy();

    const voiceSelect = page.locator('#voice-select');
    const selectAriaLabel = await voiceSelect.getAttribute('aria-label');
    expect(selectAriaLabel).toBeTruthy();
  });

  test('all buttons are keyboard focusable', async ({ page }) => {
    // Tab through and verify focus
    const playButton = page.locator('button:has-text("Play")').first();
    await playButton.focus();
    await expect(playButton).toBeFocused();

    const stopButton = page.locator('button:has-text("Stop")');
    await stopButton.focus();
    await expect(stopButton).toBeFocused();

    const downloadButton = page.locator('button:has-text("Download")');
    await downloadButton.focus();
    await expect(downloadButton).toBeFocused();
  });

  test('component layout is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const controls = page.locator('.retrospective-speech .controls');
    await expect(controls).toBeVisible();

    const buttons = page.locator('.retrospective-speech button');
    const firstButton = buttons.first();
    const boundingBox = await firstButton.boundingBox();
    const viewportWidth = page.viewportSize().width;

    // Button should be wide on mobile
    expect(boundingBox.width).toBeGreaterThan(viewportWidth * 0.7);
  });

  test('user preferences are persisted in localStorage', async ({ page }) => {
    // Set preferences
    const voiceSelect = page.locator('#voice-select');
    const speedSlider = page.locator('#rate-slider');
    const pitchSlider = page.locator('#pitch-slider');

    await speedSlider.fill('1.8');
    await pitchSlider.fill('1.3');

    // Check localStorage
    const preferences = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('retrospectiveSpeech') || '{}');
    });

    expect(preferences.rate).toBe(1.8);
    expect(preferences.pitch).toBe(1.3);

    // Refresh page
    await page.reload();

    // Wait for component
    await page.waitForSelector('[role="region"][aria-label="Text-to-speech controls"]', { timeout: 5000 });

    // Verify preferences restored
    const newSpeedValue = await speedSlider.inputValue();
    const newPitchValue = await pitchSlider.inputValue();

    expect(parseFloat(newSpeedValue)).toBeCloseTo(1.8, 1);
    expect(parseFloat(newPitchValue)).toBeCloseTo(1.3, 1);
  });

  test('status region is live for accessibility', async ({ page }) => {
    const statusRegion = page.locator('.status[role="region"]');
    const ariaLive = await statusRegion.getAttribute('aria-live');
    expect(ariaLive).toBe('polite');
  });
});
