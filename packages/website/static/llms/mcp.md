# Unovis MCP workflow for agents

[Discovery index](../llms.txt) · [Setup](../docs/mcp/getting-started.md) · [Generated tools reference](../docs/mcp/tools.md)

The `@unovis/mcp` server generates charts locally. Connect it with `npx -y @unovis/mcp` as a stdio server, or follow the setup guide for a self-hosted streamable HTTP deployment. The Unovis website is documentation; do not assume it hosts a public MCP endpoint.

## Discover before calling

1. Call `get_unovis_info` with `{}` to see the connected server's available chart tools, themes, output types, framework identifiers, and palette.
2. Inspect the selected tool's input schema through MCP `tools/list`. Deployments can hide tools, and installed versions can differ from the website.
3. Read the [tools reference](../docs/mcp/tools.md) for field semantics and examples. Select a tool matching the analytical task, then pass records and documented field-name arguments.
4. Choose an output format, inspect the result, and adjust the data or chart options as needed.

## Example tool call

For a server that lists `generate_line_chart`, these are example arguments:

```json
{
  "data": [
    { "month": "2024-01", "sales": 120, "cost": 80 },
    { "month": "2024-02", "sales": 145, "cost": 95 }
  ],
  "x": "month",
  "xIsTime": true,
  "y": ["sales", "cost"],
  "outputType": "code",
  "framework": "react"
}
```

Here `x` and `y` name data fields. They are not browser-library accessor functions. Tool output `config` is a serializable [ChartSpec](../docs/mcp/chart-spec.md), whose materialized accessors follow its own specification. Consult the [JSON Schema](../schema/chart-spec.v0.1.json) for structural validation and the [core API reference](api/index.md) for configuration properties inside extensible config objects. Do not invent a documentation-search MCP tool: this server provides chart tools and `get_unovis_info`; its documentation and schema are linked files.

## Pick the output

| Need | `outputType` | Notes |
| --- | --- | --- |
| Portable vector chart | `svg` | Standalone SVG text, the default |
| Raster image | `png` | Rendered image; `scale` controls pixel density |
| A self-contained interactive chart | `html` | Writes an HTML file |
| Inline interactive chart in a compatible host | `interactive` | Requires MCP Apps support; use HTML when host support is unavailable |
| Edit the serializable specification | `config` | Returns ChartSpec JSON |
| Embed a chart in an application | `code` | Set `framework` to `ts`, `react`, `angular`, `svelte`, `vue`, or `solid` |

`outputPath` writes an artifact and is subject to the server's write policy. See [output types](../docs/mcp/output-types.md) for shared options and restrictions. Tool schemas intentionally expose a focused subset of the library; for advanced composition, use generated framework code with the [framework guide](frameworks.md) and [component properties](api/index.md), or the [programmatic rendering API](../docs/mcp/programmatic.md).
