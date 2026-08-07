---
mdx:
  format: md
description: Fonts, blank charts, timeouts and known limits
sidebar_position: 9
---
# Troubleshooting

<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->

## The first render is slow

Expected. The first call initialises jsdom, imports `@unovis/ts`, and downloads
Inter once (~34MB into `~/.cache/unovis-mcp/fonts/`). Later renders are
milliseconds. To avoid the download entirely:

```bash
UNOVIS_MCP_NO_DOWNLOAD=1 unovis-mcp          # system fonts instead
UNOVIS_MCP_FONTS_DIR=/path/to/fonts unovis-mcp   # your own fonts
```

If a client enforces a strict tool-call timeout, do one warm-up render after
starting the server.

## Text looks slightly wrong: clipped, trimmed, or oddly spaced

Text measurement drives label trimming, wrapping and axis margins, so the font
used for measuring must match the font used for drawing.

- **In SVG/PNG output**, measurement uses the provisioned Inter. If you replaced
  it via `UNOVIS_MCP_FONTS_DIR` with metrics that differ from the declared font
  stack, labels can be trimmed too eagerly or overflow.
- **In interactive HTML**, the viewer's machine supplies the font. Text may be a
  few pixels different from the SVG. Nothing to fix — just don't expect them to
  be pixel-identical.

## The client rejects the whole tool list

If a client refuses to start with something like `input_schema: JSON schema is
invalid. It must match JSON Schema draft 2020-12`, a tool schema is using a
construct that only exists in draft-07. One bad schema takes down every tool,
not just its own, because the tool list is validated as a unit.

The SDK converts Zod v3 through `zod-to-json-schema`, which targets draft-07.
Most of that output is valid 2020-12 as well; two things are not, and both are
enforced by `test/tool-schemas.test.ts`:

- **`z.tuple([a, b])`** lowers to the draft-07 array form of `items`, where
  2020-12 requires `items` to be a schema. Use `z.array(a).length(2)`.
- **Reusing one schema instance** inside a tool makes the converter emit
  `$ref: #/properties/…`. That's valid, but clients that flatten refs drop the
  subschema, leaving a property with no type — an array argument then arrives as
  a string. Shared leaves (`fieldName()`, `hexColor()`) are factories so every
  use site gets a fresh instance.

## A chart is blank

Work through these in order:

1. **Is it an interactive chart in a background tab?** Browsers pause
   `requestAnimationFrame` for hidden pages, and Unovis renders through it. The
   chart appears when the tab becomes visible. This also means automated
   screenshots of hidden pages come out empty — make the page visible first.
2. **Are you calling `renderToSvg` without wiring `onRenderComplete`?** The
   render throws with that exact message; pass `ctx.onRenderComplete` into the
   container config.
3. **Is the data empty, or are the field names wrong?** The tools validate field
   names and reply with the available fields; a hand-written spec does not.
4. **Async layout?** A `Graph` with `layoutType: 'force'` needs
   `ctx.requireComponentReady()` plus the component's `onRenderComplete`.

## "Chart rendering did not complete"

The container never reported finishing. Either `onRenderComplete` isn't wired
(see above), or a component threw during a frame — the error message includes any
frame errors that were captured.

## Graph layouts

`generate_network_graph` offers `force`, `circular`, `concentric` and `dagre`,
and all four work in static output *and* interactive output.

**ELK** is the exception. It renders fine in Node through a hand-written spec:

```ts
components: [{ type: 'Graph', config: { layoutType: 'elk', layoutElkSettings: { 'elk.algorithm': 'layered' } } }]
```

…but it isn't a tool option, because elkjs is a 1.4MB engine loaded through a
dynamic import that the single-file widget bundle would have to inline. Offering
it would mean `outputType: "html"` silently producing a broken chart.

> Dagre required `@unovis/graphlibrary` ≥ 2.2.0-3 and
> `@unovis/dagre-layout` ≥ 0.8.8-3. Earlier releases shipped extensionless ESM
> imports that no standards-compliant Node loader could resolve.

## The `tsx` loader can't load graph layouts

Running this package's **source** through `tsx` fails on the dynamic imports
inside Unovis's graph layouts: the layout promise never settles, so the render
times out after 20 seconds with "component layout never completed". Plain Node
and vitest both work.

That's why `pnpm dev` and `pnpm samples` build first and run the compiled
output. `pnpm dev:tsx` is available for fast iteration, with the caveat that
graph charts will not render under it.

## PNG has a transparent background

Pass one. CSS `background-color` isn't an SVG rendering attribute, so rasterizers
ignore it:

```ts
await svgToPng(svg, { width, scale: 2, background: themeBackground('dark') })
```

The `png` output type does this for you.

## Interactive output doesn't render in my client

`outputType: "interactive"` depends on MCP UI resource support, which is
experimental and unevenly implemented. Use `outputType: "html"` — it works
everywhere because it's just a file.

## Large datasets

Data arrives inside the tool call, so it passes through the model's context.
Hundreds of rows are comfortable; tens of thousands are wasteful; millions are
the wrong tool — aggregate first, or use the library directly
([Programmatic use](./programmatic.md)) where data never touches a model.

## Charts touch the image edges / I want no padding

Static output frames the chart with 16px sides and bottom, 12px top. Via the
library you can change it:

```ts
await renderToSvg({ width: 800, height: 400, padding: { top: 0, right: 0, bottom: 0, left: 0 } }, build)
```

## Multiple charts in one HTML document collide

They shouldn't — ids are rewritten with a per-render prefix specifically to make
that safe. If you need byte-stable output (snapshot tests), pass a constant
`idPrefix`.

## Something renders differently than in the browser

Report it. The headless environment reimplements browser geometry, so a mismatch
is a real bug in this package (or occasionally in Unovis, where several have
already been found and fixed upstream). Useful details: the chart spec, the
output, and what you expected.

## What the tests don't cover

Worth knowing before you trust a green suite:

- **Real-browser rendering of interactive output.** The jsdom tests execute the
  real widget bundle, but jsdom has no layout or paint: no pixel positions, no
  transitions, and `ResizeObserver` is stubbed. A crosshair bug that jsdom passed
  was found only by opening a real browser.
- **MCP UI widget rendering** in an actual client.
- **Visual regression.** Snapshots catch structural drift, not "this looks
  wrong". `pnpm samples` exists for human review.
- **Non-`ts` code targets aren't compiled.** The vanilla-TypeScript output is
  type-checked against `@unovis/ts`; the JSX and template targets are checked
  structurally only.
