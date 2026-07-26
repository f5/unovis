import { describe, expect, it } from 'vitest'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

import { buildServer } from '../src/server.js'
import type { ToolFilterOptions } from '../src/tools/register.js'

async function connect (options: ToolFilterOptions = {}): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = buildServer(options)
  const client = new Client({ name: 'test-client', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return client
}

const lineArgs = {
  data: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }],
  x: 'x',
  y: 'y',
}

const firstText = (result: Awaited<ReturnType<Client['callTool']>>): string => {
  const content = result.content as { type: string; text?: string }[]
  return content[0]?.text ?? ''
}

describe('mcp server', () => {
  it('lists chart tools with input schemas', async () => {
    const client = await connect()
    const { tools } = await client.listTools()
    const names = tools.map(t => t.name)
    expect(names).toContain('generate_line_chart')
    expect(names).toContain('generate_bar_chart')
    expect(names).toContain('generate_donut_chart')
    expect(names).toContain('generate_sankey_diagram')
    expect(names).toContain('get_unovis_info')

    const line = tools.find(t => t.name === 'generate_line_chart')
    expect(line?.description).toMatch(/line chart/i)
    const properties = (line?.inputSchema as { properties: Record<string, unknown> }).properties
    expect(properties).toHaveProperty('data')
    expect(properties).toHaveProperty('theme')
  })

  it('renders a line chart as SVG text', async () => {
    const client = await connect()
    const result = await client.callTool({ name: 'generate_line_chart', arguments: lineArgs })
    expect(result.isError).toBeFalsy()
    const text = firstText(result)
    expect(text.startsWith('<svg')).toBe(true)
    expect(text).toContain('</svg>')
    expect(text).not.toContain('var(')
  })

  it('returns the chart spec for outputType config', async () => {
    const client = await connect()
    const result = await client.callTool({
      name: 'generate_line_chart',
      arguments: { ...lineArgs, outputType: 'config' },
    })
    const spec = JSON.parse(firstText(result))
    expect(spec.container).toBe('xy')
    expect(spec.components[0].type).toBe('Line')
    expect(spec.components[0].config.x).toEqual({ $field: 'x', as: 'number' })
  })

  it('returns an actionable error for a missing field', async () => {
    const client = await connect()
    const result = await client.callTool({
      name: 'generate_line_chart',
      arguments: { ...lineArgs, y: 'nope' },
    })
    expect(result.isError).toBe(true)
    expect(firstText(result)).toContain('Available fields')
    expect(firstText(result)).toContain('"y"')
  })

  it('hides tools via disabledTools and honors enabledTools', async () => {
    const disabled = await connect({ disabledTools: ['generate_donut_chart'] })
    const { tools } = await disabled.listTools()
    expect(tools.map(t => t.name)).not.toContain('generate_donut_chart')

    const only = await connect({ enabledTools: ['generate_bar_chart'] })
    const { tools: onlyTools } = await only.listTools()
    expect(onlyTools.map(t => t.name).filter(n => n.startsWith('generate_'))).toEqual(['generate_bar_chart'])
  })

  it('serializes concurrent renders safely', async () => {
    const client = await connect()
    const results = await Promise.all(Array.from({ length: 4 }, (_, i) => client.callTool({
      name: 'generate_line_chart',
      arguments: { ...lineArgs, title: `Chart ${i}` },
    })))
    for (const [i, result] of results.entries()) {
      expect(result.isError).toBeFalsy()
      expect(firstText(result)).toContain(`Chart ${i}`)
    }
  })
})
