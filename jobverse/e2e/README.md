# E2E Testing with Playwright

End-to-end tests for JobVerse application using Playwright.

## Setup

Install dependencies:
```bash
npm install
```

Install browsers:
```bash
npx playwright install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests with UI mode (interactive):
```bash
npm run test:ui
```

Run tests in headed mode (see browser):
```bash
npm run test:headed
```

Show test report:
```bash
npm run test:report
```

Run specific test file:
```bash
npx playwright test e2e/homepage.spec.js
```

## Test Suites

### 1. Homepage Tests (`homepage.spec.js`)
- Homepage loads correctly
- Navigation to jobs page
- Trending jobs section displays
- Login navigation

### 2. Job Search Tests (`job-search.spec.js`)
- Jobs list displays
- Search by keyword
- Filter by location
- Navigate to job detail
- Category filtering

### 3. Job Application Tests (`job-application.spec.js`)
- Login redirect for unauthenticated users
- Quick Apply button visibility
- Job details display
- Apply modal functionality

### 4. Authentication Tests (`authentication.spec.js`)
- Login page display
- Registration page display
- Form validation
- Navigation between auth pages
- Google OAuth button

### 5. Companies Tests (`companies.spec.js`)
- Companies list display
- Company detail navigation
- Company jobs display
- Company reviews section

## Writing New Tests

Example test:
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');

    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Configuration

See `playwright.config.js` for configuration options:
- Base URL: `http://localhost:5173`
- Browser: Chromium
- Screenshots on failure
- Trace on retry

## CI/CD Integration

Tests can be run in CI/CD pipeline:
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm test
```

## Best Practices

1. Use data-testid attributes for stable selectors
2. Wait for elements to be visible before interaction
3. Use `expect` with timeout for async operations
4. Clean up test data after tests
5. Use beforeEach for common setup
6. Keep tests independent and isolated
