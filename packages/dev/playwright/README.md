# Playwright Testing Setup

This directory contains Playwright end-to-end tests for the Unovis visualization library.

## Structure

- `tests/` - Contains test files
- `utils/` - Helper utilities for tests

## Running Tests

### Prerequisites

Make sure your development server is running:

```bash
npm run serve
```

### Test Commands

```bash
# Run all tests headlessly
npm run test:playwright

# Run tests with UI mode (interactive)
npm run test:playwright:ui

# Run specific test
npx playwright test unovis.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```
