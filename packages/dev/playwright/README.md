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

### Agent workflow

1. **Reproduce.** Start `pnpm dev` and reproduce the issue in the smallest relevant example.
   Record the expected and actual behavior. Use controls or query config to make the case shareable.
2. **Capture before.** Before editing, record the exact URL and browser viewport. Keep seed, time,
   theme, dimensions, and playback settings fixed. Use `capture=1` for chart captures; use ordinary
   gallery mode for navigation or code-panel fixes. Reload, wait for readiness as described below
   (and any example-specific async work), and save a screenshot with normal browser tools.
3. **Fix.** Make the smallest change in the responsible package (core for component logic), or
   correct the example if its configuration is the cause. Keep capture plumbing in the dev app
   and follow the generated-wrapper rules.
4. **Verify interactions.** Exercise relevant hover, click, selection, brush, pan, zoom, and control
   behavior. Also check ordinary gallery mode when capture suppresses the behavior being tested,
   such as animations. Check browser errors and run the relevant lint, build, and targeted tests.
5. **Capture after.** Reload the same URL at the same viewport, restore the same interaction state,
   wait again, and capture the same region. Inspect both images for the intended fix and unintended
   changes. Share both screenshots, the reproduction URL and viewport, and verification results;
   state any remaining limitations.

### Capture settings and readiness

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
Automatic demos also accept `paused=1` to start paused or `paused=0` to start playing,
including outside capture mode. The Play/Pause control then holds or resumes updates.
Without an explicit `paused` value, capture mode starts these demos paused; ordinary
gallery mode preserves their usual playback defaults.
Seed and time affect the shared data generators and the examples using `getCurrentTime`; they do not override `Math.random`, the
browser clock, external data, or independent generators. Examples with random accessors or
continuous animation may need stable data or a pause control before taking screenshots.

Representative examples checked for repeatable captures:

| Example | Route | Capture behavior |
| --- | --- | --- |
| Plot Line | `/examples/Plotline/Plot%20Line` | All five series use precomputed seeded data; controls preserve the data |
| XY Labels | `/examples/Xy%20Labels/Stacked%20Bar%20with%20Labels` | Bar data and alert positions stay fixed across renders |
| Graph | `/examples/Graph/Graph:%20Custom%20Node%20Fills%20with%20Tooltip` | Readiness waits for the async force layout to render |
| MapFitToPoints | `/examples/Topojson/MapFitToPoints` | Uses bundled geography; capture mode disables flow and zoom animations |

Capture mode loads the gallery fonts before mounting the example. Transition demos start
paused, and the graph adapter disables flow particles during capture. Wait for
`[data-testid="example-capture"][data-capture-ready="true"]`, then capture that element or
its visible region. The ready signal waits for fonts, images, and DOM/layout changes to
settle. The dev-only adapter in `src/capture/react.tsx` waits for graph rendering and
disables graph flow particles and TopoJSON map flow and zoom animations. It preserves component refs and existing
render callbacks; ordinary gallery mode applies query config without capture overrides. Keep capture
plumbing in this adapter, outside copyable examples. Other async data sources, canvas
rendering, and future async work need additional readiness handling in the dev app; a
quiet DOM alone does not establish readiness.

The audit also covers the extra series in Multi Line, Plotband, and the axis demos;
scatter stroke widths; legend colors; timeline icon widths; treemap updates; generated
circular/radial/donut data; and graph label data. Random values are seeded and calculated
outside accessors. Examples with controls keep their generated data across renders.

Automatic update demos share the same playback controls and URL defaults: Timeline
Animation Tweaking and Arrows, Dynamic Layout, Graph SVG Node Icons, Graph Multiple Link
Labels, Graph Link Label Icons, Graph Link Flow Speed, Axis Tick Label Overlap, Half Donut
Full Height, Partial Data & Updates, Force Show At Position, Point Shapes, and the stale
handler reproduction. Flow-only graph and TopoJSON map demos can also pause their flow.
Existing transition and stacked-bar playback controls honor `paused` too. Playback
controls update `paused` in the URL, so reloading a copied link preserves that choice.

All SVG and HTML components accept component config overrides using the library's actual prop names:

```text
?config={"plotline":{"value":5,"lineWidth":4,"labelText":"Threshold"},"line":{"lineWidth":3}}
```

Keys use the component name without `Vis`, starting with a lowercase letter: `line`,
`groupedBar`, `bulletLegend`, `leafletMap`, etc. The acronym keys are `xyLabels` and
`topoJSONMap`. Overrides apply to every instance of that component in the example.
Containers and the TimeSeries composite retain their original exports.

URL-encode the JSON when constructing a URL. The Plot Line controls read and update that
same config; **Copy link** copies the current URL, and **Reset** removes only the
`plotline` entry from `config`. Other component entries, seed, theme, and capture settings
stay in place. The dev-only React adapter also applies these overrides to other
component instances. Capture mode always forces duration to zero; Graph and TopoJSONMap
also retain their readiness, flow, and zoom handling. Example configuration controls
read and write this shared state. Their Reset button clears the namespaces used by that
example while preserving unrelated component entries, seed, theme, and capture settings.

This is a direct shallow config override, without a per-example validation schema.
Values must match the component API. JSON values (including arrays and rich-text objects)
are supported; functions are never evaluated. Data, refs, children, event handlers, and
callbacks remain defined in code. Use `null` to clear a prop to `undefined`. Malformed
JSON is ignored. Custom dash arrays appear as Custom in the style control; rich-text
labels appear as JSON in the text input and are replaced by plain text when edited.

Stacked Bar with Labels uses `config.xyLabels` for `clustering` and `labelFontSize`.
Its example-only `showLabels` flag controls mounting the data-label layer; alert labels
remain mounted. Font overrides apply to both XYLabels instances. Reset removes only
`config.xyLabels`, and Copy link includes the shared config. Use the same seed and
viewport with a fresh page load to reproduce generated data.

Other configuration controls use `useComponentState`, a small adapter over the same
`useComponentConfig` hook. Direct component settings use their actual prop names, for example
`config.graph.layoutType`, `config.axis.tickTextAngle`, or `config.sankey.zoomScale`.
Example-only options use `config.example`: chart and data presets, dataset sizes,
layer visibility, function choices, search text, and the bleed matrices' label/placement
presets. These options are consumed by the example instead of passed to library components.
Direct component overrides take precedence over props derived from an example preset.
For example:

```text
?config={"topoJSONMap":{"pointRadius":12},"example":{"numPoints":3}}
```

The control helper supports functional setters and keeps their identity stable for effects
and callbacks. Multiple updates in one event preserve each other. Function choices, such
as sorting or tiling, are stored as names or indices and resolved to functions in code.
Live data, hover state, measurement output, and imperative actions (regenerate data,
zoom, fit view, or re-mount) keep their local behavior. Auto-updating datasets do not
rewrite the URL on each frame. Small explicit Circular Bar value presets are shared
alongside their preset choice. No per-example defaults or validation catalog is needed.

Readiness still has limits:

- A ready signal describes the current frame; it cannot predict a future one-shot timer.
  For example, Custom Style Brush applies its initial selection after a delay.
- The Leaflet Color Map's delayed update honors playback; its existing `staticData=1`
  option remains available. Leaflet examples still depend on remote tiles/styles and
  require checking map readiness in the browser. The gallery ready signal does not
  establish tile or WebGL completion. Control-state tests use raster rendering to
  isolate URL behavior; check the MapLibre renderer separately for map changes.
- The Heatmap Accessor Update reproduction displays measured elapsed time. Compare its
  chart and PASS/FAIL result rather than expecting the elapsed-time text to match pixels.

Review both screenshots, check browser errors, and exercise the behavior being fixed.
Add a targeted behavioral test when appropriate. Existing Playwright tests, including
capture-mode checks, run through the regular configuration:

```bash
pnpm exec playwright test capture-mode.spec.ts --project=chromium
```
