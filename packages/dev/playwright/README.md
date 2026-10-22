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

## Agent workflow

Reproduce → capture before → fix → verify interactions → capture after. Keep comparison settings
matched, review and share both screenshots, and restore temporary experiments. Sample dense data,
varied font sizes, multiline labels, and dynamic updates when changing shared styles.

### Safari / WebKit

Test SVG text, wrapping, and clipping changes early in WebKit. Check nested `<tspan>` elements as
well as parent `<text>` elements; explicit baseline inheritance may be needed. Verify visible
bounds and allow equivalent computed-style names across engines (e.g. `text-before-edge` and
`text-top`). Use Playwright WebKit for automated coverage, record the tested engine/version, and
verify Safari-specific bugs in installed Safari when available. Report which one was tested.
