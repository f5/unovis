/** Interaction events, tested against the real bundle: a click dispatched on
 * a rendered element must surface as a normalized ChartEvent — through the
 * direct API and as a `unovis:event` message over the embed protocol. */
import { describe, expect, it, beforeAll } from 'vitest'
import { z } from 'zod'

import { buildChartDocument, buildEmbedDocument } from '../src/html/document.js'
import { donutRecipe } from '../src/recipes/donut.js'
import { barRecipe } from '../src/recipes/bar.js'
import type { ChartSpec } from '../src/render/spec.js'
import type { ChartEvent } from '../src/widget/events.js'

import { loadPage, settle } from './widget-harness.js'
import type { LoadedPage } from './widget-harness.js'

import donutFixtures from './fixtures/donut.js'
import barFixtures from './fixtures/bar.js'

/** ComponentCore binds user events through a 500ms-throttled setup pass, so
 * listeners appear up to half a second after the last render frame */
const eventsBound = async (page: LoadedPage): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 550))
  page.raf.flushAll()
}

const click = (page: LoadedPage, selector: string): void => {
  const el = page.window.document.querySelector(selector)
  expect(el, `clickable element ${selector}`).toBeTruthy()
  el!.dispatchEvent(new page.window.MouseEvent('click', { bubbles: true }))
}

describe('widget interaction events', () => {
  let donutSpec: ChartSpec
  let barSpec: ChartSpec

  beforeAll(() => {
    donutSpec = donutRecipe.toSpec(z.object(donutRecipe.inputShape).parse(donutFixtures[0].input))
    barSpec = barRecipe.toSpec(z.object(barRecipe.inputShape).parse(barFixtures[0].input))
  })

  it('reports clicks through the direct API, unwrapped to the data record', async () => {
    const page = await loadPage(buildChartDocument(donutSpec, { duration: 0 }))
    const events: ChartEvent[] = []

    // Re-render through the public API with the callback attached
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (page.window as any).UnovisChart
    const host = page.window.document.createElement('div')
    page.window.document.body.appendChild(host)
    api.render(donutSpec, host, { duration: 0, onEvent: (e: ChartEvent) => events.push(e) })
    await settle(page, 'path[class*="segment"]')
    await eventsBound(page)

    // Scope to the re-rendered chart — the document's own chart has no handler
    const target = host.querySelector('path[class*="segment"]')
    expect(target, 'clickable segment in the host chart').toBeTruthy()
    target!.dispatchEvent(new page.window.MouseEvent('click', { bubbles: true }))
    expect(events).toHaveLength(1)
    expect(events[0].component).toBe('Donut')
    expect(events[0].event).toBe('click')
    // The datum is the caller's record, not an internal arc wrapper
    const datum = events[0].datum as Record<string, unknown>
    expect(datum).not.toHaveProperty('startAngle')
    expect(Object.values(datum).some(v => typeof v === 'number')).toBe(true)
    expect(JSON.parse(JSON.stringify(datum))).toEqual(datum)
  })

  it('does not attach listeners when the host has not opted in', async () => {
    const page = await loadPage(buildChartDocument(donutSpec, { duration: 0 }))
    expect(page.errors).toEqual([])
    // no onEvent — clicking must not throw or post anything
    const messages: unknown[] = []
    page.window.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.type === 'unovis:event') messages.push(e.data)
    })
    click(page, 'path[class*="segment"]')
    await settle(page, 'html')
    expect(messages).toEqual([])
  })

  it('posts unovis:event over the embed protocol when events: true', async () => {
    const page = await loadPage(buildEmbedDocument())
    const received: Record<string, unknown>[] = []
    page.window.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.type === 'unovis:event') received.push(e.data)
    })

    page.window.postMessage({ type: 'unovis:render', spec: barSpec, options: { duration: 0, events: true } }, '*')
    await settle(page, '#uv-embed-root .uv-chart svg path[class*="bar"]')
    await eventsBound(page)

    click(page, '#uv-embed-root path[class*="bar"]')
    // postMessage delivery is a macrotask in jsdom
    for (let i = 0; i < 20 && !received.length; i++) await new Promise(resolve => setTimeout(resolve, 10))
    expect(received).toHaveLength(1)
    expect(received[0].component).toMatch(/Bar/)
    expect(received[0].event).toBe('click')
    expect(received[0].datum).toBeTruthy()
  })
})
