---
mdx:
  format: md
description: Install the server and connect it to your client
sidebar_position: 2
---
# Getting started

<!-- Generated from packages/mcp/docs — edit there, then run `pnpm sync:mcp-docs`. -->

## Requirements

- **Node.js 20 or newer.** Native dependencies ship as prebuilt binaries
  (`@napi-rs/canvas`, `@resvg/resvg-js`), so there is no compile step and no
  `node-gyp`.
- Nothing else. No browser download, no database, no API keys.

## Connect a client

The server speaks stdio by default, which is what every MCP client uses for
local servers. You register it once; the client starts and stops it for you.

### Claude Code

```bash
claude mcp add unovis -- npx -y @unovis/mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

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

### Cursor

Add to `.cursor/mcp.json` in your project (or the global equivalent):

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

### Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.unovis]
command = "npx"
args = ["-y", "@unovis/mcp"]
```

Codex runs in a terminal and cannot display inline images, so prefer
`outputType: "svg"` (plain text) or `outputPath` (writes a file, returns the
path). See [Output types](./output-types.md).

### VS Code

```json
{
  "servers": {
    "unovis": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@unovis/mcp"]
    }
  }
}
```

### Any other MCP client

There is nothing client-specific in the server: standard stdio JSON-RPC,
`tools/list` + `tools/call`, plus one optional UI resource. If your client
speaks MCP, point it at `npx -y @unovis/mcp`.

## Verify the installation

```bash
npx @unovis/mcp --version
npx @modelcontextprotocol/inspector npx -y @unovis/mcp
```

The Inspector lists every tool with its schema and lets you call one
interactively — the fastest way to confirm the server works before wiring it
into an agent.

## Remote / shared deployments

For a team server, use the streamable HTTP transport:

```bash
npx @unovis/mcp --transport http --host 0.0.0.0 --port 3737 --endpoint /mcp
```

```bash
claude mcp add --transport http unovis https://charts.example.com/mcp
```

Two things to know before exposing it:

- **There is no built-in authentication.** Keep it on a private network or put
  a reverse proxy with a bearer-token check in front.
- **File writes are disabled by default on HTTP.** `outputPath` (and the
  file-only `html` output) would otherwise let any client write to any path
  the process can reach. Opt in with `--allow-write-dir /srv/charts` to allow
  writes inside one directory; stdio servers are unrestricted, acting with
  their user's own authority.
- **Renders are serialized per process** (one shared jsdom document). The
  server is stateless, so scale by running several replicas behind a load
  balancer rather than expecting concurrency from one instance.

A container image needs nothing unusual:

```dockerfile
FROM node:24-slim
RUN npm install -g @unovis/mcp
# Pre-provision fonts so containers don't download them on first render
ENV UNOVIS_MCP_FONTS_DIR=/fonts
COPY fonts/ /fonts/
EXPOSE 3737
CMD ["unovis-mcp", "--transport", "http", "--host", "0.0.0.0"]
```

## CLI options

```
--transport <stdio|http>   Transport (default: stdio)
--host <host>              HTTP bind address (default: 127.0.0.1)
--port <port>              HTTP port (default: 3737)
--endpoint <path>          HTTP endpoint path (default: /mcp)
--tools <a,b,...>          Expose only these tools
--version                  Print the version
--help                     Show usage
```

Diagnostics go to stderr; stdout carries only protocol traffic.

## Environment variables

| Variable | Purpose |
|---|---|
| `DISABLED_TOOLS` | Comma-separated tool names to hide |
| `UNOVIS_MCP_FONTS_DIR` | Directory of font files to use for text measurement |
| `UNOVIS_MCP_NO_DOWNLOAD` | Set to `1` to skip the one-time Inter download and use system fonts |

## Limiting the tool surface

Some clients degrade with large tool counts, and you may simply not want maps
or graphs. Both directions are supported:

```bash
# Allowlist
unovis-mcp --tools generate_line_chart,generate_bar_chart,generate_donut_chart

# Denylist
DISABLED_TOOLS=generate_choropleth_map,generate_network_graph unovis-mcp
```

`get_unovis_info` always reports the tools that are actually active, so an
agent can discover the trimmed surface at runtime.

## First render

Ask your agent something like:

> Chart the deploy counts in `deploys.csv` by week as a bar chart, and save it
> to `docs/deploys.svg`

A well-behaved agent reads the file, calls `generate_bar_chart` with the parsed
rows and `outputPath: "/abs/path/docs/deploys.svg"`, and tells you where the
file landed.
