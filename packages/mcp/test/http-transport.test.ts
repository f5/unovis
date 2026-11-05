import { createServer } from 'node:http'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { describe, expect, it } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

import { buildServer } from '../src/server.js'
import { APPS_EXTENSION_ID, sniffAppsCapability } from '../src/tools/register.js'

describe('streamable HTTP transport', () => {
  it('forwards handler assignment and removal through the SDK accessor', () => {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    const accessor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(transport), 'onmessage')
    expect(accessor?.set).toBeTypeOf('function')
    sniffAppsCapability(buildServer(), transport)
    transport.onmessage = (): undefined => undefined
    expect(accessor?.get?.call(transport)).toBe(transport.onmessage)
    transport.onmessage = undefined
    expect(accessor?.get?.call(transport)).toBeUndefined()
  })

  it('dispatches initialize, list and call requests through HTTP', async () => {
    const httpServer = createServer(async (req, res) => {
      const server = buildServer({ enabledTools: ['generate_bar_chart'] })
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
      res.on('close', () => {
        transport.close().catch(() => undefined)
        server.close().catch(() => undefined)
      })
      await server.connect(transport)
      await transport.handleRequest(req, res)
    })
    const client = new Client({ name: 'http-test', version: '0.0.0' }, {
      capabilities: { extensions: { [APPS_EXTENSION_ID]: {} } },
    })
    httpServer.listen(0, '127.0.0.1')
    await once(httpServer, 'listening')
    try {
      const { port } = httpServer.address() as AddressInfo
      await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)))
      const { tools } = await client.listTools()
      expect(tools.some(tool => tool.name === 'generate_bar_chart')).toBe(true)
      const result = await client.callTool({
        name: 'generate_bar_chart',
        arguments: { data: [{ category: 'Rent', amount: 900 }], x: 'category', y: 'amount', outputType: 'config' },
      })
      expect(result.isError).not.toBe(true)
      expect(result.content).toEqual([expect.objectContaining({ type: 'text', text: expect.stringContaining('Rent') })])
    } finally {
      await client.close()
      httpServer.closeAllConnections()
      await new Promise<void>((resolve, reject) => httpServer.close(error => error ? reject(error) : resolve()))
    }
  }, 5000)
})
