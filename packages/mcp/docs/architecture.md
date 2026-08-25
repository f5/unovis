# Architecture

Unovis is a browser-first library: it builds SVG by manipulating a live DOM with
D3, measures text with canvas, reads theme values from CSS custom properties, and
schedules every render through `requestAnimationFrame`. None of that exists in
Node. This package makes it exist.

```
tool call ──► recipe ──► ChartSpec ──► materializer ──► Unovis components
                                                             │
                    ┌────────────────────────────────────────┘
                    ▼
        headless environment (jsdom + shims)
                    │
                    ▼
        flush frames until quiescent
                    │
                    ▼
        SVG post-processing ──► standalone SVG ──► PNG (resvg)
```

## Layers

| Package / directory | Responsibility |
|---|---|
| **`@unovis/ssr`** `src/env/` | The headless browser: jsdom plus the shims Unovis needs |
| **`@unovis/ssr`** `src/svg/` | Turning a live SVG element into a standalone document |
| **`@unovis/ssr`** `src/headless.ts`, `src/rasterize.ts` | `renderToSvg` (the SSR primitive) and SVG → PNG |
| `src/render/` | `materialize.ts` (spec → components), `renderer.ts` (spec → SVG via `renderToSvg`) |
| `src/recipes/` | Tool inputs → `ChartSpec` (one file per chart type) |
| `src/codegen/` | `ChartSpec` → framework source |
| `src/widget/` + `src/html/` | The browser bundle and the documents that host it |
| `src/tools/`, `src/server.ts`, `src/cli.ts` | The MCP surface |

The dependency arrows only point one way: [`@unovis/ssr`](https://www.npmjs.com/package/@unovis/ssr)
knows nothing about specs, and `render` knows nothing about MCP. `renderToSvg`
is the package boundary: this server consumes it exactly the way any other
SSR consumer would, and re-exports it unchanged.

## The environment shims

Installed **before** `@unovis/ts` is imported, because the library captures
its environment at module load.

| Shim | Why it's needed |
|---|---|
| **Flushable `requestAnimationFrame`** | Containers defer rendering by one frame, and several components schedule follow-up frames. A queue we can drain makes rendering synchronous and deterministic. |
| **Canvas 2D context** (`@napi-rs/canvas`) | Text measurement (`measureText`) drives label trimming, wrapping and axis margins. Unovis snapshots the context at module scope, hence the ordering requirement. |
| **`getBBox`, `getBoundingClientRect`, `getTotalLength`, `getPointAtLength`** | jsdom performs no layout at all. Text boxes come from real canvas metrics; shapes from attribute math; paths from `svg-path-bounds` / `svg-path-properties`; groups from the union of children mapped through their transforms. |
| **`getComputedStyle` wrapper** | Unovis resolves its entire theme through `--vis-*` custom properties, which jsdom doesn't cascade. The wrapper resolves them from a parsed `:root` map (with dark-theme overrides) and synthesizes font properties. |
| **Element sizing** | `clientWidth`/`clientHeight` are always 0 in jsdom; containers read them to size charts. |
| **No-op `ResizeObserver`** | Containers construct one on every render. |

Fonts are provisioned once at startup: the pinned Inter release is downloaded
(SHA-256 verified) into `~/.cache/unovis-ssr/fonts/` and registered with the
canvas. Text then measures against the same font the output declares. Offline,
it degrades to system fonts.

## Getting a deterministic render

1. Every component and container gets `duration: 0`. Unovis's `smartTransition`
   returns the plain selection for a falsy duration, so all attribute writes
   happen immediately instead of over time.
2. The frame queue is drained repeatedly, letting each flush schedule follow-up
   frames, until it stays empty.
3. The container's `onRenderComplete` must fire before serialization. Components
   with asynchronous layouts (force-directed graphs, which dynamically import
   their solver) signal separately through their own `onRenderComplete`.
4. If either signal never arrives, the render throws with the reason instead of
   emitting a half-drawn chart.

## Making the SVG standalone

The rendered DOM is full of page-context dependencies. The post-processor
removes all of them:

1. **Import external defs** — globally injected pattern definitions the chart
   references get copied into its own `<defs>`.
2. **Inline the stylesheet** — emotion's rules are matched with
   `querySelectorAll` and written as inline styles, then the class attributes are
   dropped. Author inline styles always win; later rules override earlier ones.
3. **Bake CSS variables** — every `var(--vis-*)` becomes a literal value for the
   requested theme, because rasterizers and `<img>` contexts don't support custom
   properties.
4. **Normalize references** — `url(http://localhost/#id)` becomes `url(#id)`
   (Unovis builds absolute references from `window.location`).
5. **Rewrite ids** — random guids become `prefix-N`, so multiple charts can share
   a document without colliding, and snapshots stay stable.
6. **Synthesize the header** — Unovis containers have no title concept and its
   legends are HTML, so the title and legend are drawn as SVG above the chart,
   and the content is offset into a padded frame.

The result has no classes, no variables, no external references — which is also
exactly what the PNG rasterizer needs, so `png` reuses it unchanged.

## The browser widget

The interactive outputs bundle the **same materializer** the headless renderer
uses, so one code path turns a spec into a chart on both sides. esbuild keeps
the bundle at ~670kB by importing components individually — the package barrel
statically pulls in Leaflet, MapLibre and Three — and by excluding elkjs, whose
1.4MB engine would dwarf everything else. A size budget in the build script
fails the build if the barrel creeps back in.

Documents don't carry those bytes raw, twice over. Two prebuilt variants split
along the dependency line — `standard` (~330kB: XY and radial charts) and
`full` (~670kB: plus sankey, chord, graph, maps, whose layout and geo engines
are most of the difference) — and the document builder picks the smallest one
that covers the spec. The chosen bundle is then inlined as a gzip+base64
payload with a ~5kB synchronous self-extracting bootstrap. Net effect: a line
chart document is ~140kB on disk, a graph document ~290kB, and the spec and
styles stay readable in both. A spec rendered against a bundle that lacks its
component fails with an explicit error, and size budgets fail the build if
either bundle outgrows its reason to exist.

Interactions are derived from the spec: per-chart-type tooltip templates, a
crosshair for continuous XY charts, and the real HTML legend. Hosts that opt
in also receive clicks as normalized events, and native WebViews get the same
protocol over their own bridge ([Interactive charts](./interactive.md),
[Native WebViews](./webview.md)).

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
layer shrinks.

## Testing strategy

| Layer | What it proves |
|---|---|
| Env unit tests | Bbox math, variable resolution, frame flushing |
| Recipe snapshots | Byte-stable SVG per chart type (with a deterministic id prefix) |
| Spec contract | Version gating, locale-aware formatting, derived time-axis ticks |
| Post-processing tests | Id rewriting, variable baking, header synthesis, theme |
| MCP integration | Real SDK client over an in-memory transport: schemas, every output type, error paths, tool filtering, concurrency |
| Tool schemas | Every advertised schema validated against the draft 2020-12 meta-schema, with no `$ref`s — the shape a client must accept before any chart can render ([why](./troubleshooting.md#the-client-rejects-the-whole-tool-list)) |
| Widget tests | The **real browser bundle** executed in jsdom: rendering, a simulated hover producing tooltip content, the embed protocol with its version handshake, clicks surfacing as normalized events, the React Native bridge and runtime theme switching |
| Widget matrix | All 15 chart types rendered interactively with a clean console |
| Codegen | Generated TypeScript **type-checked against `@unovis/ts`** |
| `pnpm samples` | Every fixture rendered to SVG + PNG, light and dark, as a contact sheet for eyeball review |

Graph charts are deliberately not snapshotted. They keep settling for a few
frames after their layout reports completion — fit-view, label collision passes
— so exact geometry depends on machine load, and `force` layouts additionally
call `Math.random()`. The renderer waits out a short grace period so real output
doesn't lose those late frames, but a byte snapshot would still be a false
signal that fails randomly under CI load. Structural assertions, the widget
matrix and the async-layout probe cover graphs instead.

`pnpm test` builds the widget bundle first, so a fresh clone can run the suite
without a manual build step.

## Continuous integration

The `mcp` job in `.github/workflows/pull_request.yml` runs on every pull
request: build (`@unovis/ts` then this package), type-check, lint, the full test
suite, and the sample gallery — which is uploaded as a build artifact so a
reviewer can look at the charts instead of trusting a green check.

Inter is cached at `~/.cache/unovis-ssr` (keyed on `@unovis/ssr`'s `src/env/fonts.ts`, which
holds the pinned version and checksum). That keeps the suite off the network and
keeps text metrics — and therefore the SVG snapshots — reproducible between
runs. If snapshots ever disagree between machines, the cause is font
provisioning, not the renderer.

What the suite can't prove is covered in
[Troubleshooting](./troubleshooting.md#what-the-tests-dont-cover).
