---
mdx:
  format: md
description: How Unovis renders headlessly in Node
sidebar_position: 9
---
# Architecture

<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->

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

The work is split across two packages:

- **[`@unovis/ssr`](https://www.npmjs.com/package/@unovis/ssr)** — the headless
  browser environment, the `renderToSvg` SSR primitive, SVG post-processing and
  SVG → PNG rasterization. It knows nothing about chart specs or MCP.
- **`@unovis/mcp`** — the chart spec and the recipes that build it, the code
  generator, the browser widget, and the MCP surface itself.

The dependency arrows only point one way: `renderToSvg` is the package
boundary, and this server consumes it exactly the way any other SSR consumer
would, and re-exports it unchanged.

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
1.4MB engine would dwarf everything else.

Documents don't carry those bytes raw, twice over. Two prebuilt variants split
along the dependency line — `standard` (~330kB: XY and radial charts) and
`full` (~670kB: plus sankey, chord, graph, maps, whose layout and geo engines
are most of the difference) — and the document builder picks the smallest one
that covers the spec. The chosen bundle is then inlined as a gzip+base64
payload with a ~5kB synchronous self-extracting bootstrap. Net effect: a line
chart document is ~140kB on disk, a graph document ~290kB, and the spec and
styles stay readable in both. A spec rendered against a bundle that lacks its
component fails with an explicit error instead of drawing a blank chart.

Interactions are derived from the spec: per-chart-type tooltip templates, a
crosshair for continuous XY charts, and the real HTML legend. Hosts that opt
in also receive clicks as normalized events, and native WebViews get the same
protocol over their own bridge ([Interactive charts](./interactive.md),
[Native WebViews](./webview.md)).
