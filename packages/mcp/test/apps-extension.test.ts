/** The MCP Apps extension (SEP-1865, io.modelcontextprotocol/ui): tools
 * declare their UI template ahead of time, the template resource carries the
 * official mime type and a fully-empty CSP (the widget's no-network property
 * as sandbox metadata), and the widget speaks the host's JSON-RPC protocol. */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

import { buildServer } from '../src/server.js'
import { WIDGET_URI, APPS_MIME_TYPE, APPS_EXTENSION_ID } from '../src/tools/register.js'
import { buildEmbedDocument } from '../src/html/document.js'
import { lineRecipe } from '../src/recipes/line.js'

import { loadPage, settle, svgOf } from './widget-harness.js'

import lineFixtures from './fixtures/line.js'

async function connect (capabilities?: Record<string, unknown>): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = buildServer()
  const client = new Client({ name: 'apps-test', version: '0.0.0' }, capabilities ? { capabilities } : undefined)
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return client
}

const APPS_CLIENT = { extensions: { [APPS_EXTENSION_ID]: {} } }

describe('mcp apps extension', () => {
  it('pins the wire constants to the extension spec', () => {
    expect(APPS_MIME_TYPE).toBe('text/html;profile=mcp-app')
    expect(APPS_EXTENSION_ID).toBe('io.modelcontextprotocol/ui')
    expect(WIDGET_URI).toMatch(/^ui:\/\//)
  })

  it('every chart tool declares the template ahead of time', async () => {
    const client = await connect()
    const { tools } = await client.listTools()
    for (const tool of tools) {
      const ui = (tool._meta as { ui?: { resourceUri?: string } } | undefined)?.ui
      if (tool.name.startsWith('generate_')) {
        expect(ui?.resourceUri, `${tool.name} declares its template`).toBe(WIDGET_URI)
      } else {
        expect(ui, `${tool.name} has no UI`).toBeUndefined()
      }
    }
  })

  it('serves the template with the official mime type and an empty CSP', async () => {
    const client = await connect()
    const { contents } = await client.readResource({ uri: WIDGET_URI })
    expect(contents[0].mimeType).toBe(APPS_MIME_TYPE)
    expect(((contents[0] as { text?: string }).text ?? '')).toContain('UnovisChart')

    const { resources } = await client.listResources()
    const widget = resources.find(r => r.uri === WIDGET_URI)
    const ui = (widget?._meta as { ui?: { csp?: { connectDomains?: string[]; resourceDomains?: string[] } } })?.ui
    // Empty allowlists — the no-network guarantee expressed as sandbox metadata
    expect(ui?.csp?.connectDomains).toEqual([])
    expect(ui?.csp?.resourceDomains).toEqual([])
  })

  it('runs the full view lifecycle: initialize → initialized → tool-result → size-changed', async () => {
    const page = await loadPage(buildEmbedDocument())
    const spec = lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse(lineFixtures[0].input))
    const outbound: Record<string, unknown>[] = []
    page.window.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.jsonrpc === '2.0' && (e.data.method || e.data.id !== undefined)) outbound.push(e.data)
    })

    // postMessage delivery is a macrotask in jsdom — poll for arrival
    const waitFor = async (predicate: () => boolean): Promise<void> => {
      for (let i = 0; i < 50 && !predicate(); i++) await new Promise(resolve => setTimeout(resolve, 10))
    }

    // The load-time handshake fired before this listener attached; restart
    // the embed to observe it (the pattern the ready-handshake test uses)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(page.window as any).UnovisChart.startEmbed()
    await waitFor(() => outbound.some(m => m.method === 'ui/initialize'))
    const init = outbound.find(m => m.method === 'ui/initialize') as { id?: unknown; params?: { protocolVersion?: string; appInfo?: { name?: string }; appCapabilities?: object } } | undefined
    expect(init, 'view initiated ui/initialize').toBeTruthy()
    expect(init!.params?.protocolVersion).toBe('2026-01-26')
    // appInfo/appCapabilities, not clientInfo — the shape the official
    // AppBridge validates (found by the conformance harness)
    expect(init!.params?.appInfo?.name).toBe('unovis-chart-widget')
    expect(init!.params?.appCapabilities).toEqual({})

    // Host answers with its context; the view must signal readiness and adopt the theme
    page.window.postMessage({ jsonrpc: '2.0', id: init!.id, result: { protocolVersion: '2026-01-26', hostInfo: { name: 'test-host', version: '0' }, hostCapabilities: {}, hostContext: { theme: 'dark' } } }, '*')
    await waitFor(() => outbound.some(m => m.method === 'ui/notifications/initialized'))
    expect(outbound.some(m => m.method === 'ui/notifications/initialized'), 'view sent initialized').toBe(true)
    expect(page.window.document.documentElement.getAttribute('data-theme')).toBe('dark')

    // Only now does a conforming host push the result
    page.window.postMessage({
      jsonrpc: '2.0',
      method: 'ui/notifications/tool-result',
      params: {
        content: [{ type: 'text', text: 'Interactive chart' }],
        structuredContent: { spec: JSON.parse(JSON.stringify({ ...spec, containerConfig: { ...spec.containerConfig, duration: 0 } })) },
      },
    }, '*')
    await settle(page, '#uv-embed-root .uv-chart svg')
    expect(svgOf(page, '#uv-embed-root .uv-chart'), 'chart rendered from JSON-RPC').toBeTruthy()
    await waitFor(() => outbound.some(m => m.method === 'ui/notifications/size-changed'))
    expect(outbound.some(m => m.method === 'ui/notifications/size-changed'), 'view reported its size').toBe(true)
  })

  it('includes the spec in every result for apps-capable clients, and only for them', async () => {
    const args = { data: [{ x: 0, y: 1 }, { x: 1, y: 3 }], x: 'x', y: 'y' }

    const apps = await connect(APPS_CLIENT)
    for (const outputType of [undefined, 'config', 'code'] as const) {
      const result = await apps.callTool({ name: 'generate_line_chart', arguments: { ...args, ...(outputType ? { outputType } : {}) } })
      const spec = (result.structuredContent as { spec?: { components?: unknown[] } } | undefined)?.spec
      expect(spec?.components, `apps client gets a spec for outputType=${outputType ?? 'svg'}`).toBeTruthy()
    }

    const plain = await connect()
    const result = await plain.callTool({ name: 'generate_line_chart', arguments: args })
    expect(result.structuredContent, 'lean response without the capability').toBeUndefined()
  })

  it('answers ping and ignores unknown JSON-RPC without breaking the legacy protocol', async () => {
    const page = await loadPage(buildEmbedDocument())
    const spec = lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse(lineFixtures[0].input))
    const replies: unknown[] = []
    page.window.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.jsonrpc === '2.0' && e.data?.id !== undefined) replies.push(e.data)
    })

    page.window.postMessage({ jsonrpc: '2.0', id: 7, method: 'ping' }, '*')
    page.window.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/tool-input', params: {} }, '*')
    // legacy protocol still renders after JSON-RPC traffic
    page.window.postMessage({ type: 'unovis:render', spec, options: { duration: 0 } }, '*')
    await settle(page, '#uv-embed-root .uv-chart svg')

    expect(svgOf(page, '#uv-embed-root .uv-chart'), 'legacy render unaffected').toBeTruthy()
    expect(replies.some(r => (r as { id?: number }).id === 7), 'ping answered').toBe(true)
  })
})
