---
mdx:
  format: md
description: The JSON format behind every generated chart
sidebar_position: 5
---
# Chart spec

<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->

Every chart in this package is described by one JSON object — the `ChartSpec`.
Tools build it from their simplified inputs; the headless renderer, the browser
widget and the code generator all consume it.

```
tool input ──(recipe)──► ChartSpec ──┬──► headless renderer ──► SVG / PNG
                                     ├──► browser widget    ──► HTML / inline widget
                                     └──► code generator    ──► framework source
```

Because the spec is plain JSON, you can obtain one with
`outputType: "config"`, edit it, and render it directly — which is how you
reach Unovis options the tool schemas deliberately don't expose.

## Shape

```ts
interface ChartSpec {
  specVersion?: number                         // contract version (see below)
  container: 'xy' | 'single'
  width: number
  height: number
  theme: 'light' | 'dark'
  title?: string
  containerConfig?: Record<string, unknown>   // extra container options
  components: { type: string; config: Record<string, unknown> }[]
  xAxis?: Record<string, unknown>              // XY containers only
  yAxis?: Record<string, unknown>
  colors?: string[]
  locale?: string                              // BCP-47, for date/number formatting
  legend?: { name: string; color?: string; paletteIndex?: number }[]
  data: unknown
}
```

- **`container: 'xy'`** holds any number of XY components (line, area, bars,
  scatter, timeline, boxplot, plus `Plotband`/`Plotline` decorations) on shared,
  domain-synchronized scales, plus optional axes.
- **`container: 'single'`** holds exactly one component (donut, sankey, heatmap,
  treemap, chord, graph, map, …).
- `components` renders in array order, so later entries draw on top.

## Versioning

The spec is a persistence format — apps store specs and commit generated embed
documents — so it carries a version. `SPEC_VERSION` (importable from
`@unovis/mcp/spec`) is the current contract; the recipes stamp it into every
spec they produce. The policy: **additions are non-breaking; the integer bumps
only on breaking changes.** A renderer or widget given a spec with a newer
major refuses with an explicit error instead of drawing a wrong or blank
chart, and the widget reports `{ version, specVersion }` in its
[`unovis:ready` handshake](./interactive.md#protocol) so hosts can assert
compatibility up front. Specs without `specVersion` are treated as current.

## A complete example

```json
{
  "container": "xy",
  "width": 800,
  "height": 480,
  "theme": "light",
  "title": "Revenue vs Target",
  "components": [
    {
      "type": "GroupedBar",
      "config": {
        "x": { "$index": true },
        "y": { "$field": "revenue", "as": "number" },
        "roundedCorners": 3
      }
    },
    {
      "type": "Line",
      "config": {
        "x": { "$index": true },
        "y": { "$field": "target", "as": "number" },
        "lineWidth": 3,
        "color": "var(--vis-color1)"
      }
    }
  ],
  "xAxis": { "tickFormat": { "$lookup": ["Jan", "Feb", "Mar"] }, "tickValues": [0, 1, 2] },
  "yAxis": { "gridLine": true, "tickFormat": { "$numTickFormat": true } },
  "legend": [
    { "name": "Revenue", "paletteIndex": 0 },
    { "name": "Target", "paletteIndex": 1 }
  ],
  "data": [
    { "revenue": 420, "target": 430 },
    { "revenue": 510, "target": 460 },
    { "revenue": 470, "target": 490 }
  ]
}
```

That spec is a bar + line combo chart — something no single tool emits today,
but which the spec layer has always supported.

## Accessor references

Unovis accessors are functions, which JSON can't hold, so the spec uses
descriptors that the renderer converts into real functions. **Nothing in a spec
is ever evaluated as code** — field names are looked up as properties, and
that's the whole mechanism.

| Descriptor | Becomes | Use |
|---|---|---|
| `{ "$field": "sales" }` | `d => d.sales` | Read a field |
| `{ "$field": "sales", "as": "number" }` | numeric coercion | Numeric fields arriving as strings |
| `{ "$field": "date", "as": "date" }` | epoch milliseconds | Time axes |
| `{ "$index": true }` | `(d, i) => i` | Categorical x positions |
| `{ "$const": 5 }` | `() => 5` | Constant value |
| `{ "$lookup": ["Jan", "Feb"] }` | index → label | Category tick labels |
| `{ "$numTickFormat": true }` | thousands separators | Numeric axis labels |
| `{ "$dateTickFormat": true }` | short date labels | Time axis labels |
| `{ "$format": { "field": "value", "prefix": "$", "suffix": " USD" } }` | formatted string | Sankey sub-labels, etc. |
| `{ "$mapField": { "field": "group", "mapping": { "a": "#4D8CFD" }, "fallback": "#ccc" } }` | category → value | Color by category |
| `{ "$unovisMap": "WorldMapTopoJSON" }` | the topojson payload | Map charts |
| `{ "$mapProjection": "AlbersUsa" }` | `MapProjection.AlbersUsa()` | Map projections |

Descriptors can appear anywhere in a component config, including nested inside
objects and arrays. `y: [{ "$field": "a" }, { "$field": "b" }]` is a two-series
chart.

## Component types

XY components (`container: "xy"`): `Line`, `Area`, `GroupedBar`, `StackedBar`,
`Scatter`, `Timeline`, `Boxplot`, `XYLabels`, `Plotband`, `Plotline`.

Single components (`container: "single"`): `Donut`, `NestedDonut`, `RadialBar`,
`Sankey`, `Heatmap`, `Treemap`, `ChordDiagram`, `Graph`, `TopoJSONMap`.

Any option from the corresponding Unovis config passes straight through, as
long as it's JSON-serializable or expressible as a descriptor. Interaction
options (events, tooltips, brushes) are meaningless for static output and are
ignored; the interactive widget adds its own.

## Rendering a spec yourself

```ts
import { renderChart } from '@unovis/mcp'

const { svg, width, height, warnings } = await renderChart(spec)
```

Charts always render with `duration: 0` so output is deterministic, and the
renderer waits for the container's `onRenderComplete` — plus the component's own
completion signal for asynchronous layouts like force-directed graphs.

## Deliberate limits

- **Functions can't be smuggled in.** If you need a bespoke callback, use the
  library directly with [`renderToSvg`](./programmatic.md#rendertosvg).
- **One coordinate system per chart.** Components in an XY container share
  synchronized domains, so mixing wildly different units (revenue and
  percentages) will flatten one of them. True dual axes aren't supported yet.
- **`Graph` layouts** are limited to `force`, `circular` and `concentric` in the
  tools; `dagre` and `elk` work through a hand-written spec in Node but not in
  the browser widget (see [Troubleshooting](./troubleshooting.md)).
