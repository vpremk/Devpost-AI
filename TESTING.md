# Testing Guide

Comprehensive testing setup for the Retrospective Speech-to-Notes application.

## Test Types

### 1. Unit Tests (React)
Test individual components and utility functions in isolation.

```bash
npm test
```

**Coverage**: Components, hooks, utilities
**Framework**: Jest + React Testing Library
**Files**: `src/**/*.test.js` or `src/**/*.spec.js`

### 2. End-to-End Tests (Playwright)
Test complete user workflows across browsers and devices.

```bash
npm run test:bdd
```

**Coverage**: Full component flows, API integration, accessibility
**Frameworks**: Playwright + Cucumber
**Files**: `tests/e2e/*.spec.js`, `tests/features/*.feature`

#### Run with UI
```bash
npm run test:bdd:ui
```

#### Debug mode
```bash
npm run test:bdd:debug
```

#### Run specific test file
```bash
npx playwright test tests/e2e/retrospective-speech.spec.js
```

#### Run specific test
```bash
npx playwright test -g "user can play retrospective notes"
```

#### Generate test report
```bash
npx playwright show-report
```

### 3. Backend API Tests
Test REST API endpoints, validation, error handling.

```bash
npm run test:bdd -- tests/e2e/backend-api.spec.js
```

**Coverage**: POST /api/tts, GET /api/health, rate limiting, auth
**Framework**: Playwright API Testing
**Files**: `tests/e2e/backend-api.spec.js`

### 4. Accessibility Tests
Verify WCAG 2.1 AA compliance.

- **Keyboard Navigation**: Tab, Enter, Space, custom shortcuts
- **Screen Reader**: ARIA labels, live regions, semantic HTML
- **Visual**: High contrast, focus states, responsive
- **Motor**: Keyboard-only operation

Run as part of E2E tests:
```bash
npx playwright test -g "@accessibility"
```

### 5. Performance Tests (Lighthouse)
CI/CD job that runs Lighthouse audits.

- Performance score: >= 0.7 (70)
- Accessibility score: >= 0.9 (90)
- Best Practices: >= 0.8 (80)
- SEO: >= 0.8 (80)

View CI logs for results.

## Local Testing Workflow

### Setup
```bash
npm install
npx playwright install  # Install browser binaries
```

### Full test suite
```bash
# Terminal 1: Start backend
npm run backend

# Terminal 2: Start frontend
npm start

# Terminal 3: Run all tests
npm run test:bdd
```

### Run tests in CI mode (single backend instance)
```bash
npm run ci:test
```

## Test File Structure

```
tests/
├── e2e/
│   ├── retrospective-speech.spec.js    # Component tests
│   └── backend-api.spec.js             # API tests
└── features/
    ├── retrospective-speech.feature    # BDD scenarios
    └── backend-tts-api.feature         # API BDD scenarios
```

## Test Coverage Reports

### Unit tests
```bash
npm test -- --coverage
```
Coverage report: `coverage/lcov-report/index.html`

### E2E tests
```bash
npx playwright show-report
```
Report location: `playwright-report/`

## Continuous Integration

GitHub Actions workflows run on every push and PR:

1. **Setup**: Install dependencies, verify Node version
2. **Lint**: ESLint (optional)
3. **Build**: React production build
4. **Unit Tests**: Jest with coverage
5. **E2E Tests**: Playwright on Chromium, Firefox, WebKit, Mobile
6. **Security**: npm audit + Snyk
7. **Lighthouse**: Performance & accessibility
8. **Deploy**: Staging (develop branch) → Production (main branch)

See `.github/workflows/ci-cd.yml` and `.github/workflows/accessibility.yml`.

## Writing Tests

### Playwright Test Example
```javascript
import { test, expect } from '@playwright/test';

test('user can play audio', async ({ page }) => {
  await page.goto('/');
  
  const playButton = page.locator('button:has-text("Play")');
  await playButton.click();
  
  const status = page.locator('.status');
  await expect(status).toContainText('Playing');
});
```

### Test with multiple browsers
```javascript
test.describe('RetrospectiveSpeech', () => {
  test('works on Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium');
    // test code
  });
});
```

### API test with authentication
```javascript
test('API requires auth', async ({ request }) => {
  const response = await request.post('http://localhost:3001/api/tts', {
    headers: { Authorization: 'Bearer token' },
    data: { text: 'Test' }
  });
  expect(response.status()).toBe(200);
});
```

## Debugging Tests

### Slow down test execution
```bash
npx playwright test --debug
```
Opens Playwright Inspector.

### View browser during test
```bash
npx playwright test --headed
```

### Generate trace for failed test
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Take screenshot / video
```javascript
await page.screenshot({ path: 'screenshot.png' });
await page.video().saveAs('video.webm');
```

## Accessibility Testing Checklist

- [ ] All buttons have `aria-label`
- [ ] Form inputs have associated `<label>` or `aria-label`
- [ ] Status changes announced via `aria-live`
- [ ] Keyboard shortcuts documented and functional
- [ ] Focus visible with CSS `:focus-visible`
- [ ] Color contrast >= 4.5:1 for text
- [ ] Mobile viewport >= 375px wide
- [ ] Touch targets >= 44px × 44px
- [ ] Respects `prefers-reduced-motion`
- [ ] Works with screen readers (NVDA, JAWS, VoiceOver)

## Performance Benchmarks

### Frontend (Lighthouse)
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1

### Backend
- POST /api/tts: < 2s (browser TTS), < 5s (server TTS)
- Rate limit: 30 requests/min per IP
- Response size: < 1MB per audio file

## Troubleshooting

### Tests hang
- Ensure backend is running: `npm run backend`
- Check port 3001 is available
- Check `baseURL` in `playwright.config.js`

### Browser not found
```bash
npx playwright install
```

### Port already in use
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process
```

### localStorage not persisting
- Clear cache between tests: `page.context().clearCookies()`
- Use `incognito: true` in browser context

### Flaky tests
- Add explicit waits: `page.waitForSelector()`
- Increase timeout: `{ timeout: 10000 }`
- Check for race conditions

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)

---

**Last Updated**: April 1, 2026
