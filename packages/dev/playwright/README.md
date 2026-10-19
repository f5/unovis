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

## Screenshots for agents

Start `pnpm dev` from the repository root. Open an example with `capture=1` and use
normal browser tools to take before and after screenshots:

```text
http://localhost:9500/examples/Grouped%20Bar/Basic%20Grouped%20Bar%20Chart?capture=1&width=1200&height=800&theme=light&seed=0.42
```

Use the same URL and browser viewport for both screenshots, and reload the page for each
capture so generated data starts from the same seed. Capture mode hides navigation, code,
and the FPS toolbar, ignores saved panel sizes, disables CSS animations, and passes
`duration={0}` to the example. Example controls remain visible.

Optional URL parameters are `width` and `height` (default 1200 × 800), `theme` (`light` or
`dark`, default `light`), `seed` (default `0.42`), and `time` (a Unix timestamp in milliseconds).
Seed and time affect the shared data generators; they do not override `Math.random`, the
browser clock, external data, or independent generators. Examples with random accessors or
continuous animation may need stable data or a pause control before taking screenshots.

Capture mode loads Inter before mounting the example. Wait for
`[data-testid="example-capture"][data-capture-ready="true"]`, then capture that element or
its visible region. The ready signal waits for fonts, images, and DOM/layout changes to
settle. For async data, maps, or simulations, mark an element inside the example
`aria-busy={loading}` until its data or layout is ready. Canvas rendering and future async
work also need an example-specific check; a quiet DOM alone does not establish readiness.

Review both screenshots, check browser errors, and exercise the behavior being fixed.
Add a targeted behavioral test when appropriate. Existing Playwright tests, including
capture-mode checks, run through the regular configuration:

```bash
pnpm exec playwright test capture-mode.spec.ts --project=chromium
```
