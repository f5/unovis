/** React Native WebView hosting, tested against the real bundle: when the
 * native bridge exists, the widget must speak strings over it and accept
 * messages on document as well as window — and a theme message must restyle
 * without the host resending the spec. */
import { describe, expect, it, beforeAll } from 'vitest'
import { z } from 'zod'

import { buildEmbedDocument } from '../src/html/document.js'
import { lineRecipe } from '../src/recipes/line.js'
import type { ChartSpec } from '../src/render/spec.js'

import { loadPage, settle } from './widget-harness.js'
import type { LoadedPage } from './widget-harness.js'

import lineFixtures from './fixtures/line.js'

/** Messages the widget pushed through the native bridge, parsed */
const bridgeMessages = (page: LoadedPage): Record<string, unknown>[] =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((page.window as any).__rnMessages as string[]).map(raw => JSON.parse(raw))

/** Load the embed document with a ReactNativeWebView bridge pre-installed,
 * the way a real WebView page starts */
async function loadWebViewPage (): Promise<LoadedPage> {
  return loadPage(buildEmbedDocument(), {
    beforeParse: (window) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      w.__rnMessages = []
      w.ReactNativeWebView = { postMessage: (data: string) => w.__rnMessages.push(data) }
    },
  })
}

describe('react native webview hosting', () => {
  let lineSpec: ChartSpec

  beforeAll(() => {
    lineSpec = lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse(lineFixtures[0].input))
  })

  it('sends the ready handshake through the bridge as a JSON string', async () => {
    const page = await loadWebViewPage()
    await settle(page, 'html')

    const ready = bridgeMessages(page).find(m => m.type === 'unovis:ready')
    expect(ready, 'ready arrived on the RN bridge, not window.parent').toBeTruthy()
    expect(typeof ready!.version).toBe('string')
    expect(typeof ready!.specVersion).toBe('number')
  })

  it('accepts a string render message delivered on document (Android)', async () => {
    const page = await loadWebViewPage()
    await settle(page, 'html')

    const event = new page.window.MessageEvent('message', {
      data: JSON.stringify({ type: 'unovis:render', spec: lineSpec, options: { duration: 0 } }),
    })
    page.window.document.dispatchEvent(event)
    await settle(page, '#uv-embed-root .uv-chart svg')

    expect(page.window.document.querySelector('#uv-embed-root .uv-chart svg'), 'chart rendered from a document-delivered string').toBeTruthy()
    const size = bridgeMessages(page).find(m => m.type === 'unovis:size')
    expect(size, 'size reported through the bridge').toBeTruthy()
  })

  it('switches theme on unovis:theme without the host resending the spec', async () => {
    const page = await loadWebViewPage()
    await settle(page, 'html')

    page.window.document.dispatchEvent(new page.window.MessageEvent('message', {
      data: JSON.stringify({ type: 'unovis:render', spec: lineSpec, options: { duration: 0 } }),
    }))
    await settle(page, '#uv-embed-root .uv-chart svg')
    expect(page.window.document.documentElement.getAttribute('data-theme')).toBeNull()

    page.window.document.dispatchEvent(new page.window.MessageEvent('message', {
      data: JSON.stringify({ type: 'unovis:theme', theme: 'dark' }),
    }))
    await settle(page, 'html[data-theme="dark"]')

    expect(page.window.document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(page.window.document.querySelector('#uv-embed-root .uv-chart svg'), 'chart re-rendered').toBeTruthy()
  })

  it('restyles an empty page when the theme arrives before any render', async () => {
    const page = await loadWebViewPage()
    await settle(page, 'html')

    page.window.document.dispatchEvent(new page.window.MessageEvent('message', {
      data: JSON.stringify({ type: 'unovis:theme', theme: 'dark' }),
    }))
    await settle(page, 'html[data-theme="dark"]')
    expect(page.window.document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
