import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { registerTools, WIDGET_URI } from './tools/register.js'
import type { ToolFilterOptions } from './tools/register.js'
import { buildEmbedDocument } from './html/document.js'

export function getPackageVersion (): string {
  try {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json')
    return JSON.parse(readFileSync(pkgPath, 'utf8')).version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export function buildServer (options: ToolFilterOptions = {}): McpServer {
  const server = new McpServer({
    name: 'unovis',
    version: getPackageVersion(),
  })
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  registerWidgetResource(server)
  registerTools(server, options)
  return server
}

/** The interactive chart widget, served as an MCP UI resource.
 *
 * Clients that support embedded UI resources fetch this once and drive it with
 * the spec from a tool call's structuredContent; the same document works as a
 * plain iframe (see the embed protocol in src/widget/entry.ts). */
function registerWidgetResource (server: McpServer): void {
  server.registerResource(
    'chart-widget',
    WIDGET_URI,
    {
      title: 'Unovis chart widget',
      description: 'Interactive chart renderer. Send it a chart spec to render.',
      mimeType: 'text/html+skybridge',
    },
    async () => ({
      contents: [{
        uri: WIDGET_URI,
        mimeType: 'text/html+skybridge',
        text: buildEmbedDocument(),
      }],
    })
  )
}
