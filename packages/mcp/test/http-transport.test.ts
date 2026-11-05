/** The streamable HTTP transport. Unlike stdio and in-memory transports, the
 * SDK's StreamableHTTPServerTransport forwards its handlers to an inner
 * transport through prototype accessors, so anything that shadows them on the
 * instance silently disconnects the server from incoming messages. */
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it } from 'vitest'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { buildServer } from '../src/server.js'
import { APPS_EXTENSION_ID } from '../src/tools/register.js'

const args = { data: [{ category: 'Rent', amount: 900 }], x: 'category', y: 'amount', outputType: 'config' }

let httpServer: Server | undefined

/** `stateless`: a fresh server+transport pair per request, the CLI's
 * `--transport http` shape. `session`: one pair for the whole connection. */
async function listen (mode: 'stateless' | 'session'): Promise<URL> {
  const pair = async (): Promise<StreamableHTTPServerTransport> => {
    const server = buildServer({ enabledTools: ['generate_bar_chart'] })
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: mode === 'session' ? randomUUID : undefined })
    await server.connect(transport)
    return transport
  }
  const shared = mode === 'session' ? await pair() : undefined
  httpServer = createServer(async (req, res) => {
    const transport = shared ?? await pair()
    if (!shared) res.on('close', () => { transport.close().catch(() => undefined) })
    await transport.handleRequest(req, res)
  })
  httpServer.listen(0, '127.0.0.1')
  await once(httpServer, 'listening')
  return new URL(`http://127.0.0.1:${(httpServer.address() as AddressInfo).port}/mcp`)
}

async function connect (url: URL, capabilities?: Record<string, unknown>): Promise<Client> {
  const client = new Client({ name: 'http-test', version: '0.0.0' }, capabilities ? { capabilities } : undefined)
  await client.connect(new StreamableHTTPClientTransport(url))
  return client
}

afterEach(async () => {
  httpServer?.closeAllConnections()
  await new Promise<void>(resolve => httpServer?.close(() => resolve()))
  httpServer = undefined
})

describe('streamable HTTP transport', () => {
  it('dispatches initialize, tools/list and tools/call statelessly', async () => {
    const client = await connect(await listen('stateless'))
    const { tools } = await client.listTools()
    expect(tools.map(t => t.name)).toContain('generate_bar_chart')
    const result = await client.callTool({ name: 'generate_bar_chart', arguments: args })
    expect(result.isError).not.toBe(true)
    expect(result.content).toEqual([expect.objectContaining({ type: 'text', text: expect.stringContaining('Rent') })])
    expect((result.structuredContent as { spec?: unknown } | undefined)?.spec, 'no spec for a client without the apps extension').toBeUndefined()
    await client.close()
  }, 5000)

  it('sees the MCP Apps capability of a session client', async () => {
    const client = await connect(await listen('session'), { extensions: { [APPS_EXTENSION_ID]: {} } })
    const result = await client.callTool({ name: 'generate_bar_chart', arguments: args })
    const spec = (result.structuredContent as { spec?: { components?: unknown[] } } | undefined)?.spec
    expect(spec?.components, 'apps client gets a spec').toBeTruthy()
    await client.close()
  }, 5000)
})
