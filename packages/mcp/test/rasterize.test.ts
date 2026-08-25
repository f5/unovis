import { describe, expect, it } from 'vitest'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

import { svgToPng, themeBackground } from '@unovis/ssr'
import { buildServer } from '../src/server.js'
import { renderChart } from '../src/render/renderer.js'
import type { ChartSpec } from '../src/render/spec.js'

const spec: ChartSpec = {
  container: 'xy',
  width: 400,
  height: 300,
  theme: 'light',
  components: [{ type: 'Line', config: { x: { $field: 'x', as: 'number' }, y: { $field: 'y', as: 'number' } } }],
  data: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }],
}

const pngDims = (png: Buffer): { width: number; height: number } =>
  ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) })

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])

describe('png rasterization', () => {
  it('rasterizes a rendered SVG at the requested scale', async () => {
    const { svg, width, height } = await renderChart(spec, { idPrefix: 'r-' })

    const retina = await svgToPng(svg, { width, scale: 2, background: themeBackground('light') })
    expect(retina.subarray(0, 4).equals(PNG_MAGIC)).toBe(true)
    expect(pngDims(retina)).toEqual({ width: width * 2, height: height * 2 })

    const plain = await svgToPng(svg, { width, scale: 1 })
    expect(pngDims(plain)).toEqual({ width, height })
  })

  it('serves PNG image content through the MCP tool', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'png-test', version: '0' })
    await Promise.all([buildServer().connect(serverTransport), client.connect(clientTransport)])

    const result = await client.callTool({
      name: 'generate_line_chart',
      arguments: { data: [{ x: 0, y: 1 }, { x: 1, y: 2 }], x: 'x', y: 'y', outputType: 'png', width: 300, height: 200, scale: 2 },
    })
    expect(result.isError).toBeFalsy()
    const content = result.content as { type: string; data?: string; mimeType?: string }[]
    expect(content[0].type).toBe('image')
    expect(content[0].mimeType).toBe('image/png')
    const png = Buffer.from(content[0].data as string, 'base64')
    expect(png.subarray(0, 4).equals(PNG_MAGIC)).toBe(true)
    expect(pngDims(png)).toEqual({ width: 600, height: 400 })
  })

  it('rejects an outputPath whose extension does not match outputType', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'png-test', version: '0' })
    await Promise.all([buildServer().connect(serverTransport), client.connect(clientTransport)])

    const result = await client.callTool({
      name: 'generate_line_chart',
      arguments: { data: [{ x: 0, y: 1 }], x: 'x', y: 'y', outputType: 'png', outputPath: '/tmp/chart.svg' },
    })
    expect(result.isError).toBe(true)
    expect((result.content as { text: string }[])[0].text).toContain('.png')
  })
})
