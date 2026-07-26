# @unovis/mcp

An [MCP](https://modelcontextprotocol.io) server that generates [Unovis](https://unovis.dev) charts as SVG — rendered **locally in Node.js**. No browser, no remote rendering services: your data never leaves the machine.

<img src="https://unovis.dev/img/unovis-social.png" alt="Unovis" width="600"/>

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
| `get_unovis_info` | Server/tool discovery info |

Every chart tool accepts flat-record `data` plus field-name accessors (`x: "month"`, `y: ["sales", "cost"]`), and the shared options `width`, `height`, `theme` (`light`/`dark`), `title`, `colors` (custom palette), plus:

- `outputType: "svg"` (default) — returns standalone SVG markup: styles inlined, CSS variables resolved, deterministic ids. Safe to embed anywhere, ready for rasterization.
- `outputType: "config"` — returns the resolved chart spec as JSON without rendering (useful for iterating before generating pixels).
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

## How it works

Unovis is a browser-first library — it renders SVG into a live DOM using D3. This package runs it headlessly:

1. a shared [jsdom](https://github.com/jsdom/jsdom) window with a shim layer providing what the browser normally would: a flushable `requestAnimationFrame` queue, canvas-backed text measurement ([@napi-rs/canvas](https://github.com/Brooooooklyn/canvas)), `getBBox`/`getBoundingClientRect` geometry polyfills, and a `getComputedStyle` wrapper that resolves `--vis-*` theme variables;
2. charts render with `duration: 0` (fully synchronous), the frame queue is drained until quiescent, and `onRenderComplete` confirms the chart is final;
3. a post-processing pass makes the SVG standalone: emotion styles are inlined as attributes, `var()` references baked to literal values (theme-aware), ids rewritten deterministically, and the title/legend header synthesized.

Fonts: on first start the server provisions Inter (Unovis's default font) for text measurement — it downloads the official [Inter release](https://github.com/rsms/inter) once (pinned version, SHA-256 verified, SIL OFL 1.1) into `~/.cache/unovis-mcp/fonts/` and reuses it from there. Offline or with `UNOVIS_MCP_NO_DOWNLOAD=1` it falls back to system fonts (metrics are close, not exact). To use your own fonts, set `UNOVIS_MCP_FONTS_DIR=/path/to/fonts` or drop font files into the package's `fonts/` directory — both take precedence over the download.

## Programmatic use

```ts
import { renderChart, buildServer, recipes } from '@unovis/mcp'

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
pnpm dev             # run the server from source (tsx)
npx @modelcontextprotocol/inspector node dist/cli.js   # interactive tool testing
```

Roadmap: PNG output (`outputType: "png"` via resvg), framework code snippets (`outputType: "code"` for React/Svelte/Vue/Angular/Solid), Graph and TopoJSON map support.
