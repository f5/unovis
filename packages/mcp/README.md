# @unovis/mcp

An [MCP](https://modelcontextprotocol.io) server that generates [Unovis](https://unovis.dev) charts as SVG — rendered **locally in Node.js**. No browser, no remote rendering services: your data never leaves the machine.

<img src="https://unovis.dev/img/unovis-social.png" alt="Unovis" width="600"/>

## Documentation

Read them on the web at [unovis.dev/docs/mcp](https://unovis.dev/docs/mcp), or in
[`docs/`](./docs/README.md) alongside the code:
[getting started](./docs/getting-started.md) ·
[tools reference](./docs/tools.md) ·
[output types](./docs/output-types.md) ·
[chart spec](./docs/chart-spec.md) ·
[programmatic use](./docs/programmatic.md) ·
[interactive charts](./docs/interactive.md) ·
[native WebViews](./docs/webview.md) ·
[architecture](./docs/architecture.md) ·
[troubleshooting](./docs/troubleshooting.md)

## Quick start

```bash
npx @unovis/mcp
```

### Claude Code

```bash
claude mcp add unovis -- npx -y @unovis/mcp
```

### Claude Desktop / Cursor (JSON config)

```json
{
  "mcpServers": {
    "unovis": {
      "command": "npx",
      "args": ["-y", "@unovis/mcp"]
    }
  }
}
```

### Streamable HTTP

```bash
npx @unovis/mcp --transport http --port 3737 --endpoint /mcp
```

## Tools

| Tool | Chart |
|---|---|
| `generate_line_chart` | Line chart (single / multi-series, time axis, data gaps) |
| `generate_area_chart` | Area chart (stacked or overlapping) |
| `generate_bar_chart` | Bar chart (grouped / stacked, vertical / horizontal) |
| `generate_scatter_plot` | Scatter plot (size, category colors, point labels) |
| `generate_donut_chart` | Donut / pie chart |
| `generate_timeline_chart` | Timeline of ranged events by lane |
| `generate_boxplot` | Box plot from raw long-format samples |
| `generate_heatmap` | Matrix heatmap |
| `generate_sankey_diagram` | Sankey flow diagram |
| `generate_treemap` | Hierarchical treemap |
| `generate_chord_diagram` | Chord diagram (nodes + weighted links) |
| `generate_nested_donut_chart` | Multi-level (sunburst-style) donut |
| `generate_radial_bar_chart` | Radial progress bars |
| `generate_network_graph` | Node-link network (force / circular / concentric / dagre layouts) |
| `generate_choropleth_map` | Geographic areas shaded by value (world, USA, Germany, UK, France, India, China) |
| `get_unovis_info` | Server/tool discovery info |

XY charts (line, area, bar, scatter, boxplot) also accept `referenceLines` (labeled threshold/target lines) and `referenceBands` (shaded ranges drawn behind the data).

Every chart tool accepts flat-record `data` plus field-name accessors (`x: "month"`, `y: ["sales", "cost"]`), and the shared options `width`, `height`, `theme` (`light`/`dark`), `title`, `colors` (custom palette), plus:

- `outputType: "svg"` (default) — returns standalone SVG markup: styles inlined, CSS variables resolved, deterministic ids. Safe to embed anywhere, ready for rasterization.
- `outputType: "png"` — returns a rendered PNG image (`scale` controls pixel density, default 2×). Rasterized locally with [resvg](https://github.com/thx/resvg-js) from the same SVG, using the same fonts as measurement.
- `outputType: "html"` — writes a **self-contained interactive** HTML file (tooltips, crosshair, hover highlighting, real HTML legend) and returns its path. Everything is inlined: no network, no build step, opens anywhere.
- `outputType: "interactive"` — returns the chart spec plus a `ui://unovis/chart` widget reference, so clients supporting MCP UI widgets render the interactive chart **inline in the conversation**. Clients without widget support fall back to the text summary.
- `outputType: "config"` — returns the resolved chart spec as JSON without rendering (useful for iterating before generating pixels).
- `outputType: "code"` — returns ready-to-paste Unovis source for `ts`, `react`, `svelte`, `vue`, `angular` or `solid` (`framework` option), data included.
- `outputPath: "/abs/path/chart.svg"` — writes the SVG to disk and returns the path instead of inline markup.

## CLI options

```
--transport <stdio|http>   default: stdio
--host <host>              default: 127.0.0.1 (http)
--port <port>              default: 3737 (http)
--endpoint <path>          default: /mcp (http)
--tools <a,b,...>          expose only these tools
--version, --help
```

Environment: `DISABLED_TOOLS=generate_heatmap,...` hides specific tools.

## Interactive charts

Static SVG/PNG is the universal baseline; `html` and `interactive` deliver live charts driven by the *same* JSON chart spec:

```
recipe → ChartSpec ─┬→ headless renderer  → SVG / PNG        (any client)
                    ├→ widget bundle      → .html file       (browser)
                    └→ widget bundle      → ui:// resource    (MCP UI clients)
```

The browser widget (everything inlined; documents are ~290kB — the bundle travels as a gzip payload with a self-extracting bootstrap) runs the **same materializer** as the headless renderer, so one code path turns a spec into a chart on both sides. It also works as a plain iframe for any web page — point an iframe at the widget with `#embed` and post it a spec:

```js
iframe.contentWindow.postMessage({ type: 'unovis:render', spec }, '*')
// iframe → host: { type: 'unovis:ready' } on load, { type: 'unovis:size', width, height } after each render
```

Interactive charts support every tool except dagre/ELK graph layouts (their layout engines are excluded from the bundle to keep it small). `interactive` output is experimental — the MCP UI widget conventions are still settling, so treat client support as best-effort and prefer `html` for guaranteed results.

## How it works

Unovis is a browser-first library — it renders SVG into a live DOM using D3. This package runs it headlessly:

1. a shared [jsdom](https://github.com/jsdom/jsdom) window with a shim layer providing what the browser normally would: a flushable `requestAnimationFrame` queue, canvas-backed text measurement ([@napi-rs/canvas](https://github.com/Brooooooklyn/canvas)), `getBBox`/`getBoundingClientRect` geometry polyfills, and a `getComputedStyle` wrapper that resolves `--vis-*` theme variables;
2. charts render with `duration: 0` (fully synchronous), the frame queue is drained until quiescent, and `onRenderComplete` confirms the chart is final;
3. a post-processing pass makes the SVG standalone: emotion styles are inlined as attributes, `var()` references baked to literal values (theme-aware), ids rewritten deterministically, and the title/legend header synthesized.

Fonts: on first start the server provisions Inter (Unovis's default font) for text measurement — it downloads the official [Inter release](https://github.com/rsms/inter) once (pinned version, SHA-256 verified, SIL OFL 1.1) into `~/.cache/unovis-ssr/fonts/` and reuses it from there. Offline or with `UNOVIS_MCP_NO_DOWNLOAD=1` it falls back to system fonts (metrics are close, not exact). To use your own fonts, set `UNOVIS_MCP_FONTS_DIR=/path/to/fonts` or drop font files into `@unovis/ssr`'s `fonts/` directory — both take precedence over the download.

## Programmatic use

```ts
import { renderChart, renderToSvg, buildServer, recipes } from '@unovis/mcp'

const { svg } = await renderChart({
  container: 'xy',
  width: 800,
  height: 480,
  theme: 'light',
  components: [{ type: 'Line', config: { x: { $field: 'x', as: 'number' }, y: { $field: 'y', as: 'number' } } }],
  data: [{ x: 0, y: 1 }, { x: 1, y: 3 }],
})
```

## Development (monorepo)

```bash
pnpm build:ts        # build @unovis/ts first — the mcp package consumes its dist
cd packages/mcp
pnpm test            # vitest: env shims, recipes (SVG snapshots), post-processing, MCP integration
pnpm samples         # renders every fixture (light+dark) to samples/out/index.html for visual QA
pnpm build:widget    # rebuilds just the browser widget bundle (chained from pnpm build)
pnpm docs:tools      # regenerates docs/tools.md from the tool schemas
pnpm dev             # run the server from source (tsx)
npx @modelcontextprotocol/inspector node dist/cli.js   # interactive tool testing
```

Roadmap: a combo (bar + line) chart tool, dashboard composition, and extracting the headless renderer as `@unovis/ssr`.
