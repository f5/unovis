/** Bundle variants: documents must carry the smallest bundle that covers
 * their spec, and a spec beyond the bundle must fail with a reason, not a
 * TypeError. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { buildChartDocument, buildEmbedDocument } from '../src/html/document.js'
import { lineRecipe } from '../src/recipes/line.js'
import { sankeyRecipe } from '../src/recipes/sankey.js'

import { loadPage, settle } from './widget-harness.js'

import lineFixtures from './fixtures/line.js'
import sankeyFixtures from './fixtures/sankey.js'

const lineSpec = (): ReturnType<typeof lineRecipe.toSpec> =>
  lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse(lineFixtures[0].input))
const sankeySpec = (): ReturnType<typeof sankeyRecipe.toSpec> =>
  sankeyRecipe.toSpec(z.object(sankeyRecipe.inputShape).parse(sankeyFixtures[0].input))

describe('bundle variants', () => {
  it('ships a meaningfully smaller standard bundle', () => {
    const full = readFileSync(new URL('../dist/widget/bundle.js', import.meta.url), 'utf8')
    const standard = readFileSync(new URL('../dist/widget/bundle.standard.js', import.meta.url), 'utf8')
    expect(standard.length).toBeLessThan(full.length * 0.8)
    // the split is real: no graph or geo machinery in the standard bundle
    expect(standard).not.toContain('dagre')
    expect(standard).not.toContain('geoMercator')
  })

  it('picks the standard bundle for XY specs and full for network specs', () => {
    const lineDoc = buildChartDocument(lineSpec(), { duration: 0 })
    const sankeyDoc = buildChartDocument(sankeySpec(), { duration: 0 })

    expect(lineDoc).toContain('data-uv-bundle="standard"')
    expect(sankeyDoc).toContain('data-uv-bundle="full"')
    expect(lineDoc.length).toBeLessThan(sankeyDoc.length * 0.7)
  })

  it('lets embed hosts opt into the standard bundle by declaring components', () => {
    expect(buildEmbedDocument()).toContain('data-uv-bundle="full"')
    expect(buildEmbedDocument({ components: ['Line', 'Donut'] })).toContain('data-uv-bundle="standard"')
    expect(buildEmbedDocument({ components: ['Graph'] })).toContain('data-uv-bundle="full"')
  })

  it('renders a network chart from its full-bundle document', async () => {
    const page = await loadPage(buildChartDocument(sankeySpec(), { duration: 0 }))
    expect(page.errors).toEqual([])
    expect(page.window.document.querySelector('.uv-chart svg'), 'sankey rendered').toBeTruthy()
  })

  it('fails with a reason when a spec outruns the bundle', async () => {
    // A standard-bundle page asked to render a sankey: the clean error, not a
    // TypeError from missing selectors
    const page = await loadPage(buildChartDocument(lineSpec(), { duration: 0 }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (page.window as any).UnovisChart
    const host = page.window.document.createElement('div')
    page.window.document.body.appendChild(host)

    expect(() => api.render(sankeySpec(), host, { duration: 0 })).toThrow(/not available in this bundle/)
  })
})
