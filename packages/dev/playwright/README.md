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

# Run all tests with Percy visual snapshots
pnpm test:playwright:percy

# Run tests with UI mode (interactive)
pnpm test:playwright:ui

# View the HTML report from the last run
pnpm test:playwright:report

# Run a specific test file
pnpm exec playwright test tooltip.spec.ts

# Run tests in a specific browser
pnpm exec playwright test --project=chromium

# Update (regenerate) screenshot baselines after intentional visual changes
pnpm exec playwright test --update-snapshots
```
