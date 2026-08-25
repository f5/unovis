# Interactive charts

Static SVG and PNG are the universal baseline. When you want hover, tooltips and
zoom, the same chart spec can be delivered as a live chart instead — driven by a
browser bundle that shares the spec layer with the headless renderer.

```
ChartSpec ──┬──► headless renderer  ──► SVG / PNG   (works everywhere)
            ├──► widget bundle      ──► .html file   (any browser)
            └──► widget bundle      ──► ui:// resource (MCP UI clients)
```

## What you get

- **Hover tooltips** tailored per chart type — bars and points show their
  record, sankey nodes show totals, map areas show their value, graph links show
  their endpoints.
- **A crosshair** on line and area charts, with a shared readout of every series
  at the hovered x position.
- **Unovis's real HTML legend** (`BulletLegend`) — impossible in standalone SVG,
  because it isn't SVG.
- **Component interactions** that come free with a live chart: graph drag and
  zoom, map panning (when enabled), label collision handling.
- **Responsive layout**: the chart fills its container and re-renders on resize.

## Self-contained HTML

```json
{ "outputType": "html", "outputPath": "/abs/path/revenue.html" }
```

or programmatically:

```ts
import { buildChartDocument } from '@unovis/mcp'

const html = buildChartDocument(spec, {
  duration: 400,          // animation ms; 0 renders immediately
  documentTitle: 'Q3 revenue',
})
```

One file, nothing external: the widget bundle, the spec, and the styles are
all inlined. XY and radial charts get a smaller bundle variant automatically
(~140kB documents), the network/flow/geo families the full one (~290kB); the
bundle ships as a gzip payload with a self-extracting bootstrap, while the
spec stays readable so committed files diff meaningfully (`compress: false`
opts out). It opens offline, survives being emailed, and can be committed to
a repo.

## Inline in the conversation

```json
{ "outputType": "interactive" }
```

The tool returns the spec as structured content plus a reference to the
`ui://unovis/chart` resource, which is the widget in embed mode. Clients that
implement MCP UI resources render it inline; the others fall back to the text
summary.

This is **experimental** — the conventions are still moving, so don't build a
product on it yet. `html` is the dependable path.

For React Native and other native WebViews, see
[Embedding in native WebViews](./webview.md).

## Embedding the widget in your own page

The widget doubles as a plain iframe component, so any web app can render Unovis
specs without bundling Unovis. Serve the embed document (it's what the `ui://`
resource returns, and `buildEmbedDocument()` produces it), point an iframe at it
with the `#embed` hash, and post it a spec. An embed carries the full bundle so
any spec renders; hosts that know their chart types can opt into the smaller
variant with `buildEmbedDocument({ components: ['Line', 'Donut'] })`:

```html
<iframe id="chart" src="/unovis-widget.html#embed" style="width:100%;border:0"></iframe>

<script>
  const frame = document.getElementById('chart')

  window.addEventListener('message', (event) => {
    if (event.data?.type === 'unovis:ready') {
      // The widget is loaded and waiting for a spec
      frame.contentWindow.postMessage({ type: 'unovis:render', spec, options: { duration: 400 } }, '*')
    }
    if (event.data?.type === 'unovis:size') {
      // Grow the iframe to fit its content
      frame.style.height = `${event.data.height}px`
    }
  })
</script>
```

### Protocol

| Direction | Message | Meaning |
|---|---|---|
| widget → host | `{ type: 'unovis:ready', version, specVersion }` | Loaded, waiting for a spec. `version` is the @unovis/mcp build, `specVersion` the [ChartSpec contract](./chart-spec.md#versioning) it understands |
| host → widget | `{ type: 'unovis:render', spec, options }` | Render this spec (replaces any previous chart) |
| host → widget | `{ type: 'unovis:theme', theme }` | Re-render the last spec in `'light'` or `'dark'` and restyle the page — no need to resend the spec |
| widget → host | `{ type: 'unovis:size', width, height }` | Content size after a render |
| widget → host | `{ type: 'unovis:event', component, componentIndex, event, datum }` | A click on a chart element — sent only when the render options set `events: true` |

Send `unovis:render` as often as you like — each one tears down the previous
chart. `options` accepts `duration`, `showTitle` and `events`.

### Interaction events

Charts are actionable, not just visible: opt in with `events: true` in the
render options and every element that has a tooltip also reports clicks —
"tap the severity slice, filter the findings list" needs nothing more than a
message listener:

```js
frame.contentWindow.postMessage({ type: 'unovis:render', spec, options: { events: true } }, '*')

window.addEventListener('message', (event) => {
  if (event.data?.type === 'unovis:event') {
    // { component: 'Donut', componentIndex: 0, event: 'click', datum: { category: 'Critical', count: 12 } }
    filterBy(event.data.datum)
  }
})
```

`datum` is your own flat data record (JSON-safe, internal render state
stripped), so the handler works with the same objects you built the spec from.
Sankey and graph links report `{ source, target, value }`; treemap and nested
donut segments report `{ key, value }`.

Two shapes don't click: **lines and areas** have no per-datum element (the
crosshair is their readout), and Unovis attaches user event listeners through
a throttled setup pass, so handlers become active **within ~500ms of the
render settling** — relevant only to automated tests that click immediately.

Using the widget API directly, pass a callback instead:

```js
window.UnovisChart.render(spec, el, { onEvent: (e) => filterBy(e.datum) })
```

## Using the widget API directly

If you'd rather not use an iframe, the bundle exposes a global:

```js
const handle = window.UnovisChart.render(spec, document.getElementById('chart'), { duration: 400 })
// …later
handle.destroy()
```

`window.UnovisChart.unovis` is the full Unovis namespace from the bundle, if you
want to build charts by hand in the same page.

## Limits

- **Graph layouts**: `force`, `circular`, `concentric` and `dagre` all work. Only
  `elk` is excluded — at 1.4MB its engine would have to be inlined into every
  generated file.
- **A background tab renders nothing until you look at it.** Browsers pause
  `requestAnimationFrame` for hidden pages, and Unovis schedules its rendering
  through it. The chart appears as soon as the tab becomes visible. This is
  ordinary browser behavior, but it surprises people (and it will make an
  automated screenshot of a hidden page come out blank).
- **Fonts** come from the viewer's machine. The document asks for the Inter
  stack and falls back to system UI fonts, so text can be a few pixels wider or
  narrower than in the SVG output, which measures with bundled Inter.
- **Map charts** embed their topojson in the file, which makes world maps
  noticeably larger than other charts.
