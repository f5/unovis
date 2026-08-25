#!/usr/bin/env node
/* unovis-mcp — MCP server generating Unovis charts as SVG, rendered locally.
 *
 * Transports:
 *   stdio (default):  unovis-mcp
 *   streamable HTTP:  unovis-mcp --transport http --port 3737 [--host 127.0.0.1] [--endpoint /mcp]
 *
 * Tool filtering:
 *   --tools generate_line_chart,generate_bar_chart   (allowlist)
 *   DISABLED_TOOLS=generate_heatmap                  (env denylist)
 *
 * Note: stdout is reserved for the stdio protocol — diagnostics go to stderr.
 */
import { parseArgs } from 'node:util'
import { createServer } from 'node:http'

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { buildServer, getPackageVersion } from './server.js'
import type { ToolFilterOptions } from './tools/register.js'

const HELP = `unovis-mcp — Unovis chart generation MCP server (local SVG rendering)

Usage:
  unovis-mcp [options]

Options:
  --transport <stdio|http>  Transport type (default: stdio)
  --host <host>             HTTP host (default: 127.0.0.1)
  --port <port>             HTTP port (default: 3737)
  --endpoint <path>         HTTP endpoint path (default: /mcp)
  --tools <a,b,...>         Only expose these tools
  --allow-write-dir <dir>   Directory outputPath may write into. stdio default:
                            anywhere (the user's own machine); http default:
                            file writes disabled
  --version                 Print version
  --help                    Show this help

Environment:
  DISABLED_TOOLS            Comma-separated tool names to hide
`

async function main (): Promise<void> {
  const { values } = parseArgs({
    options: {
      transport: { type: 'string', default: 'stdio' },
      'allow-write-dir': { type: 'string' },
      host: { type: 'string', default: '127.0.0.1' },
      port: { type: 'string', default: '3737' },
      endpoint: { type: 'string', default: '/mcp' },
      tools: { type: 'string' },
      version: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  })

  if (values.help) {
    console.error(HELP)
    return
  }
  if (values.version) {
    console.error(getPackageVersion())
    return
  }

  const filter: ToolFilterOptions = {
    disabledTools: (process.env.DISABLED_TOOLS ?? '').split(',').map(s => s.trim()).filter(Boolean),
    enabledTools: values.tools?.split(',').map(s => s.trim()).filter(Boolean),
    // A local stdio server acts with its user's own authority; an HTTP
    // endpoint must not be a remote file-write primitive
    writeDir: values['allow-write-dir'] ?? (values.transport === 'http' ? false : undefined),
  }

  if (values.transport === 'stdio') {
    const server = buildServer(filter)
    await server.connect(new StdioServerTransport())
    console.error('unovis-mcp: listening on stdio')
    return
  }

  if (values.transport !== 'http') {
    console.error(`Unknown transport: ${values.transport} (expected stdio or http)`)
    process.exitCode = 1
    return
  }

  const port = Number(values.port)
  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    if (url.pathname !== values.endpoint) {
      res.writeHead(404).end()
      return
    }
    if (req.method !== 'POST') {
      // Stateless mode: no SSE streams or sessions to resume
      // eslint-disable-next-line @typescript-eslint/naming-convention
      res.writeHead(405, { Allow: 'POST' }).end()
      return
    }
    try {
      // A fresh server+transport pair per request keeps the server stateless
      const server = buildServer(filter)
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
      res.on('close', () => {
        transport.close().catch(() => undefined)
        server.close().catch(() => undefined)
      })
      await server.connect(transport)
      await transport.handleRequest(req, res)
    } catch (e) {
      console.error('unovis-mcp: request failed:', e)
      if (!res.headersSent) res.writeHead(500).end()
    }
  })

  httpServer.listen(port, values.host, () => {
    console.error(`unovis-mcp: listening on http://${values.host}:${port}${values.endpoint}`)
  })
}

main().catch((e) => {
  console.error('unovis-mcp: fatal:', e)
  process.exitCode = 1
})
