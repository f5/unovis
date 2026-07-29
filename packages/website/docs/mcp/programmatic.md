---
mdx:
  format: md
description: Render charts from your own code, scripts or CI
sidebar_position: 6
---
# Programmatic use

<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->

The MCP server is the packaging, not the engine. Everything it does is exported,
so you can render charts from a script, a build step, a web server, or your own
MCP server.

```bash
npm install @unovis/mcp
```

## Render a chart spec

```ts
import { renderChart } from '@unovis/mcp'

const { svg, width, height, warnings } = await renderChart({
  container: 'xy',
  width: 800,
  height: 400,
  theme: 'light',
  title: 'Weekly deploys',
  components: [{
    type: 'GroupedBar',
    config: { x: { $index: true }, y: { $field: 'count', as: 'number' } },
  }],
  xAxis: { tickFormat: { $lookup: ['W1', 'W2', 'W3'] }, tickValues: [0, 1, 2] },
  yAxis: { gridLine: true },
  data: [{ count: 12 }, { count: 19 }, { count: 14 }],
})

await writeFile('deploys.svg', svg)
```

See [Chart spec](./chart-spec.md) for the full format. `warnings` is normally
empty; non-fatal render issues land there rather than throwing.

## Use the tool schemas instead of hand-writing specs

The recipes that back the tools are exported, so you can reuse their validation
and defaults:

```ts
import { recipeByName, renderChart } from '@unovis/mcp'
import { z } from 'zod'

const recipe = recipeByName.get('generate_line_chart')!
const input = z.object(recipe.inputShape).parse({
  data: [{ m: 'Jan', sales: 10 }, { m: 'Feb', sales: 14 }],
  x: 'm',
  y: 'sales',
})

const { svg } = await renderChart(recipe.toSpec(input))
```

## `renderToSvg`

The headless primitive underneath everything: it creates the DOM, drives the
render to completion, and serializes standalone SVG. Use it when you want to
write ordinary Unovis code — with real accessor functions and any config option
— rather than a JSON spec.

```ts
import { renderToSvg } from '@unovis/mcp'

interface Row { date: number; value: number }

const { svg } = await renderToSvg({
  width: 900,
  height: 400,
  theme: 'dark',
  title: 'Latency p95',
}, (ctx) => {
  const line = new ctx.unovis.Line<Row>({
    x: d => d.date,
    y: d => d.value,
    duration: 0,
  })

  return new ctx.unovis.XYContainer<Row>(ctx.container, {
    components: [line],
    xAxis: new ctx.unovis.Axis<Row>({ duration: 0, tickFormat: t => new Date(Number(t)).toISOString().slice(0, 10) }),
    yAxis: new ctx.unovis.Axis<Row>({ duration: 0, label: 'ms' }),
    width: ctx.width,
    height: ctx.height,
    duration: 0,
    onRenderComplete: ctx.onRenderComplete,
  }, rows)
})
```

Three rules, all of which the API nudges you toward:

1. **Use `ctx.unovis`, don't import `@unovis/ts` yourself.** The library captures
   its environment when it loads — emotion inserts stylesheets, text measurement
   grabs a canvas context — so it has to be imported *after* the shims are in
   place. `ctx.unovis` is that already-initialised namespace.
2. **Wire `ctx.onRenderComplete` into the container config.** It's how the
   renderer knows drawing finished. Omit it and you get an explicit error rather
   than a blank chart.
3. **Pass `duration: 0`.** Animations are meaningless for a static render and
   would leave transitions half-applied. (Components default to 600ms, so set it
   on components too.)

For components whose layout is asynchronous — `Graph` with a force layout —
declare it so the render waits:

```ts
await renderToSvg({ width: 800, height: 600 }, (ctx) => {
  ctx.requireComponentReady()
  const graph = new ctx.unovis.Graph({
    layoutType: 'force',
    duration: 0,
    onRenderComplete: ctx.onComponentReady,
  })
  return new ctx.unovis.SingleContainer(ctx.container, {
    component: graph, width: ctx.width, height: ctx.height, duration: 0,
    onRenderComplete: ctx.onRenderComplete,
  }, { nodes, links })
})
```

### Options

| Option | Default | Notes |
|---|---|---|
| `width`, `height` | required | Final image size |
| `theme` | `light` | |
| `title`, `legend` | — | Synthesized into the SVG header |
| `colors` | — | Hex palette overriding `--vis-colorN` |
| `padding` | 12/16/16/16 | Frame around the chart; pass zeros to disable |
| `idPrefix` | random | Set a constant for byte-stable snapshots |
| `keepClasses` | `false` | Keep emotion classes and skip style inlining (debug) |

## PNG rasterization

```ts
import { renderToSvg, svgToPng, themeBackground } from '@unovis/mcp'

const { svg, width } = await renderToSvg({ width: 800, height: 400 }, build)
const png = await svgToPng(svg, { width, scale: 2, background: themeBackground('light') })
await writeFile('chart.png', png)
```

`background` matters: CSS `background-color` isn't an SVG rendering attribute,
so a rasterizer would otherwise give you a transparent backdrop.

## Interactive HTML

```ts
import { buildChartDocument } from '@unovis/mcp'

await writeFile('chart.html', buildChartDocument(spec, { duration: 400 }))
```

See [Interactive charts](./interactive.md) for the widget and iframe embedding.

## Generate framework code

```ts
import { generateCode } from '@unovis/mcp'

for (const file of generateCode(spec, 'react')) {
  await writeFile(file.name, file.content)   // Chart.tsx
}
```

Angular returns two files (template + component class).

## Add these tools to your own MCP server

If you already run an MCP server — say one that queries your warehouse — you can
add charting to it instead of running a second process:

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerTools } from '@unovis/mcp'

const server = new McpServer({ name: 'my-server', version: '1.0.0' })

registerMyOwnTools(server)
registerTools(server, { disabledTools: ['generate_choropleth_map'] })
```

Or take the whole prebuilt server and attach your own transport:

```ts
import { buildServer } from '@unovis/mcp'

const server = buildServer({ enabledTools: ['generate_line_chart', 'generate_bar_chart'] })
await server.connect(myTransport)
```

## Example: charts in CI

A build step that regenerates documentation assets, in both themes:

```ts
import { renderChart, svgToPng, themeBackground } from '@unovis/mcp'
import { writeFile } from 'node:fs/promises'

const metrics = JSON.parse(await readFile('metrics.json', 'utf8'))

for (const theme of ['light', 'dark'] as const) {
  const { svg, width } = await renderChart({
    container: 'xy',
    width: 900,
    height: 360,
    theme,
    title: 'Bundle size over time',
    components: [{ type: 'Area', config: { x: { $field: 'commit', as: 'number' }, y: { $field: 'kb', as: 'number' } } }],
    xAxis: { label: 'commit' },
    yAxis: { label: 'kB', gridLine: true },
    data: metrics,
  })

  await writeFile(`docs/bundle-size-${theme}.svg`, svg)
  await writeFile(`docs/bundle-size-${theme}.png`,
    await svgToPng(svg, { width, scale: 2, background: themeBackground(theme) }))
}
```

No browser, no display server — this runs on any CI runner.

## Performance notes

- The first render initialises jsdom, imports `@unovis/ts` and provisions fonts
  (roughly a second, plus a one-time font download). Later renders are
  milliseconds.
- Renders are **serialized** through a mutex: one shared jsdom document and one
  animation-frame queue mean concurrent renders would interfere. Parallelise
  across processes if you need throughput.
- Data lives in memory as-is. Thousands of points are fine; millions are the
  wrong tool.
