# Playwright Testing Setup

This directory contains Playwright end-to-end tests for the Unovis visualization library.

## Structure

- `tests/` - Contains test files
- `utils/` - Helper utilities for tests

## Running Tests

### Prerequisites

Make sure your development server is running:

```bash
pnpm serve
```

### Test Commands

Run these from `packages/dev`:

```bash
# Run all tests headlessly
pnpm test:playwright

# Run tests with UI mode (interactive)
pnpm test:playwright:ui

# Run a specific test file
pnpm exec playwright test tooltip.spec.ts

# Run tests in a specific browser
pnpm exec playwright test --project=chromium
```
