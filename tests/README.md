# Quick Start: Running Tests Locally

## Prerequisites
```bash
npm install
npx playwright install
```

## Run All Tests
```bash
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend
npm start

# Terminal 3: Tests
npm run test:bdd
```

## Run Specific Tests

### Component tests only
```bash
npx playwright test tests/e2e/retrospective-speech.spec.js
```

### API tests only
```bash
npx playwright test tests/e2e/backend-api.spec.js
```

### Specific test by name
```bash
npx playwright test -g "user can play"
```

### With UI mode (interactive)
```bash
npm run test:bdd:ui
```

### In debug mode
```bash
npm run test:bdd:debug
```

## View Results

### HTML Report
```bash
npx playwright show-report
```

### Unit test coverage
```bash
npm test -- --coverage
```

## Troubleshooting

### Backend not starting?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing process
kill -9 <PID>

# Try again
npm run backend
```

### Tests timing out?
- Ensure backend is running: `curl http://localhost:3001/api/health`
- Ensure frontend is running: `curl http://localhost:3000`
- Increase timeout in playwright.config.js

### Browser not found?
```bash
npx playwright install
npx playwright install-deps
```

---

For comprehensive guide, see [TESTING.md](TESTING.md)
