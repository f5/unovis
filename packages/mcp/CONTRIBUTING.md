# Contributing to @unovis/mcp

User documentation lives in [`docs/`](./docs) and is published to
[unovis.dev](https://unovis.dev/docs/mcp) by
`packages/website/scripts/sync-mcp-docs.mjs`. This file holds the
contributor-facing material: how the package is tested, what CI enforces,
and the upstream work in flight.

## Testing strategy

| Layer | What it proves |
|---|---|
| Env unit tests | Bbox math, variable resolution, frame flushing |
| Visual regression | Every fixture compared as pixels against a text-stored SVG baseline (both sides rasterized at test time) — attribute noise passes, visual changes fail with a reviewable diff image |
| Spec contract | Version gating, locale-aware formatting, derived time-axis ticks |
| Post-processing tests | Id rewriting, variable baking, header synthesis, theme |
| MCP integration | Real SDK client over an in-memory transport: schemas, every output type, error paths, tool filtering, concurrency |
| Tool schemas | Every advertised schema validated against the draft 2020-12 meta-schema, with no `$ref`s — the shape a client must accept before any chart can render (see below) |
| Widget tests | The **real browser bundle** executed in jsdom: rendering, a simulated hover producing tooltip content, the embed protocol with its version handshake, clicks surfacing as normalized events, the React Native bridge and runtime theme switching |
| Widget matrix | All 15 chart types rendered interactively with a clean console |
| Browser smoke lane | Headless Chromium (real layout, paint and input): every family renders with a clean console, hover produces the crosshair readout, a click travels the embed protocol, the theme message re-renders — the interactions jsdom cannot exercise |
| Codegen | Generated TypeScript **type-checked against `@unovis/ts`** |
| `pnpm samples` | Every fixture rendered to SVG + PNG, light and dark, as a contact sheet for eyeball review |

Graph charts are deliberately not snapshotted — even as pixels. They keep
settling for a few frames after their layout reports completion — fit-view,
label collision passes — so exact geometry depends on machine load, and
`force` layouts additionally call `Math.random()`. The renderer waits out a
short grace period so real output doesn't lose those late frames, but a
snapshot would still be a false signal that fails randomly under CI load.
Structural assertions, the widget matrix and the async-layout probe cover
graphs instead.

`pnpm test` builds the widget bundle first, so a fresh clone can run the suite
without a manual build step.

### What the tests don't cover

Worth knowing before you trust a green suite:

- **Touch devices.** The Chromium smoke lane (`pnpm test:browser`) covers real
  layout, paint, mouse hover and clicks — added after a crosshair bug passed
  every jsdom test — but taps, drags and tooltip-linger semantics on actual
  touch hardware remain untested.
- **MCP Apps rendering in a commercial host.** The lifecycle is verified
  against the official AppBridge host implementation in the Chromium lane
  (sandboxed iframe, real handshake) — Claude/ChatGPT-specific behavior is not.
- **Pixel baselines are light-theme.** Visual regression rasterizes every
  fixture against committed baselines; dark theme is exercised structurally and
  in `pnpm samples`, not pixel-compared.
- **Non-`ts` code targets aren't compiled.** The vanilla-TypeScript output is
  type-checked against `@unovis/ts`; the JSX and template targets are checked
  structurally only.

## Tool schema shape rules

The Anthropic API validates `input_schema` against JSON Schema draft 2020-12
and rejects the whole request — every tool, not just the offending one — so a
schema-shape regression takes the server completely offline in a way no render
test can see.

The SDK converts Zod v3 through `zod-to-json-schema`, which targets draft-07.
Most of that output is valid 2020-12 as well; two things are not, and both are
enforced by `test/tool-schemas.test.ts`:

- **`z.tuple([a, b])`** lowers to the draft-07 array form of `items`, where
  2020-12 requires `items` to be a schema. Use `z.array(a).length(2)`.
- **Reusing one schema instance** inside a tool makes the converter emit
  `$ref: #/properties/…`. That's valid, but clients that flatten refs drop the
  subschema, leaving a property with no type — an array argument then arrives
  as a string. Shared leaves (`fieldName()`, `hexColor()`) are factories so
  every use site gets a fresh instance.

## Spec schema baseline

The additive-only promise on the published chart-spec schema is enforced, not
promised: a frozen baseline of the current schema is committed next to it in
`schema/`, and CI fails if the schema removes a property, changes a type,
drops an enum value, or adds a new requirement — the four ways an "additive"
change quietly isn't. Breaking on purpose means bumping the spec minor (while
at 0.x) and freezing a new baseline, so breaks are chosen, never stumbled
into.

## Continuous integration

The `mcp` job in `.github/workflows/pull_request.yml` runs on every pull
request: build (`@unovis/ts`, then `@unovis/ssr`, then this package),
type-check, lint, a docs-sync drift check, the full test suite, the Chromium
smoke lane, and the sample gallery — which is uploaded as a build artifact so
a reviewer can look at the charts instead of trusting a green check.

Inter is cached at `~/.cache/unovis-ssr` (keyed on `@unovis/ssr`'s
`src/env/fonts.ts`, which holds the pinned version and checksum). That keeps
the suite off the network and keeps text metrics — and therefore the SVG
snapshots — reproducible between runs. Baselines are SVG text, one element per
line: a visual change reviews as a few changed lines instead of one unreadable
kilometer, and git stores deltas instead of binary copies. The formatter is
parse-aware and provably pixel-neutral — a control test requires zero
differing pixels between the compact and formatted forms, because whitespace
inside SVG text content is significant and "formatting is safe" is a claim,
not a given. Both the baseline and the fresh render rasterize through the same
resvg on the same machine at compare time, so platform differences cancel —
the tight pixel tolerance only absorbs sub-pixel jitter from harmless baseline
drift.

## Local development

`pnpm dev` and `pnpm samples` build first and run the compiled output, because
running this package's **source** through `tsx` fails on the dynamic imports
inside Unovis's graph layouts: the layout promise never settles, so the render
times out with "component layout never completed". `pnpm dev:tsx` is available
for fast iteration, with the caveat that graph charts will not render under
it. Plain Node and vitest both work.

## Upstream changes

A handful of fixes belong in `@unovis/ts` rather than in shims, and were made
there:

- `ContainerCore` falls back to the configured width/height when `clientWidth`
  is 0 (detached or non-layouting environments).
- `getPixelsPerInch` pre-seeds its cache before measuring — without layout,
  `getComputedStyle` returns the specified value (`'128in'`), which recursed
  infinitely.
- Root `index.js` / `maps.js` entries so `@unovis/ts` resolves in plain Node.

The trend matters: as the core becomes SSR-friendlier, `@unovis/ssr`'s shim
layer shrinks. Three upstream issues track the next deletions:
[#888](https://github.com/f5/unovis/issues/888) (text measurement via canvas
instead of getBBox — retires the hardest shim),
[#889](https://github.com/f5/unovis/issues/889) (event binding without the
500ms throttle window), and
[#890](https://github.com/f5/unovis/issues/890) — already fixed upstream: the
diagnostics are cleared and the core build now fails if the entry
declarations are missing, which retired this package's post-build workaround.
One down, two to go.
