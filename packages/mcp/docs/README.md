# @unovis/mcp documentation

An MCP server that turns data into [Unovis](https://unovis.dev) charts —
rendered locally in Node, with no browser and no remote services.

## Pages

| Page | What's in it |
|---|---|
| [Getting started](./getting-started.md) | Install and connect from Claude Code, Claude Desktop, Cursor, Codex, VS Code; HTTP transport; environment variables |
| [Tools reference](./tools.md) | Every tool with all its options, generated from the live schemas |
| [Output types](./output-types.md) | `svg`, `png`, `html`, `interactive`, `config`, `code` — what each returns and when to use it |
| [Chart spec](./chart-spec.md) | The JSON IR behind every chart: containers, components, accessor references |
| [Programmatic use](./programmatic.md) | Use it as a library: `renderChart`, the `renderToSvg` SSR primitive, PNG rasterization, embedding the tools in your own MCP server |
| [Interactive charts](./interactive.md) | The browser widget, self-contained HTML, iframe embedding, MCP UI resources |
| [Native WebViews](./webview.md) | React Native embedding: the bridge, theme switching without reloads, version pinning |
| [Architecture](./architecture.md) | How headless rendering actually works, and why each piece exists |
| [Troubleshooting](./troubleshooting.md) | Fonts, blank charts, timeouts, large data, known limitations |

## The 30-second version

```bash
claude mcp add unovis -- npx -y @unovis/mcp
```

Then ask for a chart. The agent calls a tool with your data:

```json
{
  "name": "generate_line_chart",
  "arguments": {
    "data": [
      { "month": "2024-01", "sales": 120, "cost": 80 },
      { "month": "2024-02", "sales": 150, "cost": 95 }
    ],
    "x": "month",
    "xIsTime": true,
    "y": ["sales", "cost"],
    "seriesLabels": ["Sales", "Cost"],
    "title": "Revenue"
  }
}
```

…and gets back a standalone SVG. Change `outputType` and the same call
returns a PNG, an interactive HTML file, the chart spec as JSON, or
ready-to-paste React/Svelte/Vue/Angular/Solid source.

## What makes it different

- **Everything is local.** Charts render in-process with jsdom; your data never
  leaves the machine, and nothing needs a network connection after install.
- **One spec, many outputs.** A single JSON chart spec drives the headless
  renderer, the interactive browser widget, and the code generator.
- **It's also a library.** `renderChart`, `renderToSvg` and the tool registry
  are exported, so the same engine works in scripts, CI, and your own MCP
  server.
