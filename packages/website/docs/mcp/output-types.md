---
mdx:
  format: md
description: SVG, PNG, interactive HTML, chart spec or framework code
sidebar_position: 4
---
# Output types

<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->

Every chart tool accepts the same `outputType`, so you pick a chart once and
decide separately how you want it delivered.

| `outputType` | Returns | Best for |
|---|---|---|
| `svg` (default) | Standalone SVG markup as text | Embedding in docs, READMEs, anything; works in every client |
| `png` | A rendered PNG image (base64) | Chat clients that display images; slides; anywhere SVG isn't accepted |
| `html` | Path to a self-contained interactive file | Exploration: tooltips, crosshair, hover |
| `interactive` | The chart spec + a widget reference | Hosts implementing the MCP Apps extension |
| `config` | The resolved chart spec as JSON | Iterating on a chart before rendering; feeding another tool |
| `code` | Ready-to-paste Unovis source | Putting the chart into your own app |

## Shared options

These exist on every chart tool:

| Option | Type | Default | Notes |
|---|---|---|---|
| `width` | number | `800` | Final image width in pixels |
| `height` | number | `480` | Final image height, before the title/legend header is added |
| `theme` | `light` \| `dark` | `light` | Dark theme bakes Unovis's dark palette and a dark background |
| `title` | string | — | Rendered as a heading above the chart |
| `colors` | string[] | — | Hex palette replacing the default one, in order |
| `locale` | string | `en-US` | BCP-47 locale for date/number formatting on axes and tooltips, e.g. `de-DE` |
| `outputType` | see above | `svg` | |
| `outputPath` | string | — | Absolute path with an extension matching `outputType` (`.svg`, `.png`, `.html`) |
| `scale` | 1–4 | `2` | PNG pixel density only |
| `framework` | `ts` \| `react` \| `svelte` \| `vue` \| `angular` \| `solid` | `ts` | `code` output only |

`width` and `height` describe the **image**, not the plot area. The chart is
drawn inside a 16px frame (12px at the top) so nothing touches the edges, and
the title/legend header adds height on top.

## `svg`

The default, and the most portable. The returned markup is genuinely
standalone:

- stylesheet rules are inlined as presentation attributes, and the emotion
  classes are stripped
- `var(--vis-*)` theme references are baked to literal colors for the requested
  theme
- element ids are rewritten with a per-render prefix, so several charts can
  coexist in one document without clashing
- no external references at all — no fonts, stylesheets, or images to fetch

That means it renders correctly inside `<img>`, in GitHub markdown, in Figma,
and in rasterizers that don't implement CSS custom properties.

```json
{ "outputType": "svg" }
```

With `outputPath`, the file gets an XML declaration and the tool returns the
path instead of the markup — useful for large charts you don't want in the
conversation.

## `png`

Rasterized locally with [resvg](https://github.com/thx/resvg-js) from the very
same SVG, using the same fonts that were used to measure the text. `scale`
multiplies the pixel dimensions (`2` gives a retina-quality image).

```json
{ "outputType": "png", "scale": 2, "width": 800, "height": 480 }
```

Returned as base64 image content, which most graphical clients render inline.
Terminal clients generally can't — use `outputPath` there.

## `html`

Writes a **self-contained interactive** document and returns its path. Opening
it gives you the real chart: hover tooltips, a crosshair readout on line and
area charts, hover highlighting, drag/zoom on graphs, and Unovis's real HTML
legend. Everything (the widget bundle, the spec, the styles) is inlined, so it
works offline and can be emailed or committed.

```json
{ "outputType": "html", "outputPath": "/abs/path/revenue.html" }
```

Without `outputPath` the file goes to a temp directory. It is always written to
disk rather than returned inline — the document is ~600kB.

See [Interactive charts](./interactive.md) for what's supported and how the
widget works.

## `interactive`

Returns the chart spec as structured content plus a reference to the
`ui://unovis/chart` widget resource, letting hosts that support the MCP Apps extension
resources render the chart **inside the conversation**. The text content is a
short summary, which is what clients without widget support will show.

```json
{ "outputType": "interactive" }
```

Implements the official MCP Apps extension (`io.modelcontextprotocol/ui`,
protocol revision 2026-07-28). Host adoption is still spreading — prefer
`html` when you need a guaranteed result.

## `config`

Returns the resolved chart spec as JSON without rendering anything. Two good
uses: letting an agent inspect and adjust a chart before spending time on
pixels, and hand-editing a spec to reach options the tool schemas don't expose.

```json
{ "outputType": "config" }
```

The result can be fed straight to `renderChart()` — see
[Chart spec](./chart-spec.md) and [Programmatic use](./programmatic.md).

## `code`

Emits ready-to-paste Unovis source for your framework, with the data included
so it runs as-is.

```json
{ "outputType": "code", "framework": "react" }
```

```tsx
import React from 'react'
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/react'

const data = [
  { q: 'Q1', rev: 42 },
  { q: 'Q2', rev: 51 },
]

const categories = [
  'Q1',
  'Q2'
]

const formatNumber = (value: number | Date): string =>
  Number(value).toLocaleString('en-US', { maximumFractionDigits: 6 })

export default function Chart (): JSX.Element {
  return (
    <>
      <VisXYContainer height={480}>
        <VisGroupedBar data={data} x={(d, i) => i} y={[d => d.rev]} orientation="vertical" roundedCorners={2} />
        <VisAxis type="x" gridLine={false} tickFormat={(index: number | Date) => categories[Math.round(Number(index))]} tickValues={[0, 1]} />
        <VisAxis type="y" gridLine={true} tickFormat={formatNumber} />
      </VisXYContainer>
    </>
  )
}
```

Notes on the generated code:

- Each framework gets its real syntax: `Vis*` components for React, Solid,
  Svelte and Vue; `<vis-*>` elements for Angular. Angular returns **two files**
  (template plus component class), because Angular templates can't contain
  arrow functions — accessors become typed class fields.
- Enum-typed props emit the enum member and its import (for example
  `curveType={CurveType.MonotoneX}` from `@unovis/ts`) rather than a bare
  string, which wouldn't type-check.
- Map charts import their topojson (`import { WorldMapTopoJSON } from
  '@unovis/ts/maps'`) instead of inlining megabytes of geometry.
- The emitted imports, generics and prop names are verified against
  `@unovis/ts`, so the vanilla-TypeScript output compiles as-is.
