# @unovis/ssr

Server-side rendering for [Unovis](https://unovis.dev): render charts to
standalone **SVG** and **PNG** in Node — no browser, no remote services, your
data never leaves the machine.

Unovis is browser-first: it builds SVG in a live DOM with D3, measures text
with canvas, reads its theme from CSS custom properties and schedules
rendering through `requestAnimationFrame`. This package provides exactly that
environment headlessly (jsdom plus a shim layer), and one primitive on top of
it.

## Render a chart

```ts
import { renderToSvg } from '@unovis/ssr'

const { svg, width, height, warnings } = await renderToSvg(
  { width: 800, height: 400, theme: 'dark', title: 'Revenue' },
  (ctx) => {
    const line = new ctx.unovis.Line<{ x: number; y: number }>({ x: d => d.x, y: d => d.y, duration: 0 })
    return new ctx.unovis.XYContainer(ctx.container, {
      components: [line],
      xAxis: new ctx.unovis.Axis({ duration: 0 }),
      yAxis: new ctx.unovis.Axis({ duration: 0 }),
      width: ctx.width,
      height: ctx.height,
      duration: 0,
      onRenderComplete: ctx.onRenderComplete,
    }, data)
  }
)
```

Any hand-built Unovis chart works — the builder receives the library
(`ctx.unovis`), a container element, and the completion hook to wire into the
container config. Pass `duration: 0` everywhere so rendering is synchronous.
The result is a standalone document: no CSS classes, no custom properties, no
external references — drop it in a README, an email, an `<img>`.

Components with asynchronous layouts (force-directed graphs) additionally wire
`ctx.onComponentReady` and call `ctx.requireComponentReady()`.

## PNG

```ts
import { svgToPng, themeBackground } from '@unovis/ssr'

const png = await svgToPng(svg, { width: 800, scale: 2, background: themeBackground('dark') })
```

CSS `background-color` is not an SVG rendering attribute, so rasterizers need
the background passed explicitly — `themeBackground` returns the Unovis theme
color.

## Fonts

Text measurement drives label trimming, wrapping and axis auto-margins, so the
measuring font must match the declared font. On first render the pinned
[Inter](https://github.com/rsms/inter) release is downloaded once (SHA-256
verified, SIL OFL 1.1) into `~/.cache/unovis-ssr/fonts/` and registered with
the canvas. Configuration:

| Variable | Meaning |
|---|---|
| `UNOVIS_SSR_FONTS_DIR` | Use your own directory of font files |
| `UNOVIS_SSR_NO_DOWNLOAD` | Set to `1` to skip the download and use system fonts |

(The pre-extraction `UNOVIS_MCP_*` names still work.)

## Building blocks

For consumers that host Unovis in their own jsdom — executing a browser bundle
in tests, for example — the shims are exported individually:
`installBBoxPolyfills`, `installCanvasHook`, `installComputedStyle`,
`RafQueue`, `defineElementSize`, and `getRenderEnv` for the fully assembled
environment.

## Relationship to @unovis/mcp

[`@unovis/mcp`](https://www.npmjs.com/package/@unovis/mcp) — the MCP server
that lets AI agents generate Unovis charts — is built on this package and
re-exports its API. Use `@unovis/ssr` directly when you want headless
rendering without the MCP surface: charts in CI, emails, PDFs, cron jobs.
Full documentation of the architecture lives in the
[MCP docs](https://unovis.dev/docs/mcp/architecture).

## Requirements

Node.js ≥ 20. Native dependencies (`@napi-rs/canvas`, `@resvg/resvg-js`) ship
prebuilt — no compile step.
