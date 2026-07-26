import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { registerTools } from './tools/register.js'
import type { ToolFilterOptions } from './tools/register.js'

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
  registerTools(server, options)
  return server
}
