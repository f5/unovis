/** outputPath is a server-side file write. A local stdio server acts with its
 * user's own authority, but an HTTP endpoint reachable by others must not be
 * a remote file-write primitive — writes are gated by a directory policy. */
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

import { buildServer } from '../src/server.js'
import { refuseWrite } from '../src/tools/register.js'
import type { ToolFilterOptions } from '../src/tools/register.js'

async function connect (options: ToolFilterOptions = {}): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = buildServer(options)
  const client = new Client({ name: 'write-policy-test', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return client
}

const lineArgs = (outputPath?: string): Record<string, unknown> => ({
  data: [{ x: 0, y: 1 }, { x: 1, y: 3 }],
  x: 'x',
  y: 'y',
  ...(outputPath ? { outputType: 'svg', outputPath } : {}),
})

const text = (result: Awaited<ReturnType<Client['callTool']>>): string =>
  (result.content as { text?: string }[])[0]?.text ?? ''

describe('refuseWrite', () => {
  it('allows anywhere when no policy is set', () => {
    expect(refuseWrite('/anywhere/chart.svg', undefined)).toBeUndefined()
  })

  it('refuses everything when writes are disabled', () => {
    expect(refuseWrite('/anywhere/chart.svg', false)).toMatch(/disabled/)
  })

  it('allows inside the sandbox and refuses outside, including prefix tricks', () => {
    expect(refuseWrite('/sandbox/chart.svg', '/sandbox')).toBeUndefined()
    expect(refuseWrite('/sandbox/nested/chart.svg', '/sandbox')).toBeUndefined()
    expect(refuseWrite('/elsewhere/chart.svg', '/sandbox')).toMatch(/must be inside/)
    // sibling directory sharing the prefix string
    expect(refuseWrite('/sandbox-evil/chart.svg', '/sandbox')).toMatch(/must be inside/)
    // traversal out of the sandbox
    expect(refuseWrite('/sandbox/../etc/chart.svg', '/sandbox')).toMatch(/must be inside/)
  })
})

describe('write policy over the protocol', () => {
  it('writes inside the allowed directory and refuses outside it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'unovis-write-'))
    const client = await connect({ writeDir: dir })

    const inside = join(dir, 'chart.svg')
    const ok = await client.callTool({ name: 'generate_line_chart', arguments: lineArgs(inside) })
    expect(ok.isError).toBeFalsy()
    expect(existsSync(inside)).toBe(true)

    const outside = join(tmpdir(), 'unovis-escape.svg')
    const refused = await client.callTool({ name: 'generate_line_chart', arguments: lineArgs(outside) })
    expect(refused.isError).toBe(true)
    expect(text(refused)).toMatch(/must be inside/)
    expect(existsSync(outside)).toBe(false)
  })

  it('with writes disabled, refuses outputPath and the file-only html output', async () => {
    const client = await connect({ writeDir: false })

    const refused = await client.callTool({ name: 'generate_line_chart', arguments: lineArgs(join(tmpdir(), 'x.svg')) })
    expect(refused.isError).toBe(true)
    expect(text(refused)).toMatch(/disabled/)

    const html = await client.callTool({
      name: 'generate_line_chart',
      arguments: { ...lineArgs(), outputType: 'html' },
    })
    expect(html.isError).toBe(true)
    expect(text(html)).toMatch(/disabled/)

    // inline outputs stay available
    const svg = await client.callTool({ name: 'generate_line_chart', arguments: lineArgs() })
    expect(svg.isError).toBeFalsy()
  })
})
