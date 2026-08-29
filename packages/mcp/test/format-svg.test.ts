/** The baseline formatter's safety contract: one element per line for
 * reviewable diffs, provably without changing a single rendered pixel —
 * whitespace IS significant inside SVG text content, so "formatting is
 * render-neutral" is a claim that needs a proof, not a comment. */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

import { svgToPng, themeBackground } from '@unovis/ssr'

import { renderChart } from '../src/render/renderer.js'
import { lineRecipe } from '../src/recipes/line.js'

import { formatSvg } from './image-snapshot.js'

import lineFixtures from './fixtures/line.js'

describe('formatSvg', () => {
  it('renders pixel-identically to the compact form — zero differing pixels', async () => {
    // A text-heavy fixture: axis ticks, multi-line labels, legend — the
    // places a careless formatter would inject visible whitespace
    const spec = lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse(lineFixtures[0].input))
    const { svg } = await renderChart(spec, { idPrefix: 'fmt-' })
    const formatted = formatSvg(svg)
    expect(formatted).not.toBe(svg)
    expect(formatted.split('\n').length).toBeGreaterThan(50)

    const background = themeBackground('light')
    const compact = PNG.sync.read(await svgToPng(svg, { scale: 1, background }))
    const pretty = PNG.sync.read(await svgToPng(formatted, { scale: 1, background }))
    expect(pretty.width).toBe(compact.width)
    const differing = pixelmatch(compact.data, pretty.data, undefined, compact.width, compact.height, { threshold: 0 })
    expect(differing, 'formatting must not move a single pixel').toBe(0)
  })

  it('is idempotent', async () => {
    const spec = lineRecipe.toSpec(z.object(lineRecipe.inputShape).parse(lineFixtures[0].input))
    const { svg } = await renderChart(spec, { idPrefix: 'fmt-' })
    const once = formatSvg(svg)
    expect(formatSvg(once)).toBe(once)
  })

  it('never adds whitespace inside text content, and attributes round-trip', async () => {
    // Raw '<' is illegal in attribute values, so the escaped form is what a
    // serializer can actually emit — assert it survives the format round-trip
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" data-note="a &gt;&lt; b"><g><text><tspan x="0">Multi</tspan><tspan x="0" dy="1em">line</tspan></text><rect width="1" height="1"/></g></svg>'
    const formatted = formatSvg(svg)
    // element children of <text> stay glued together
    expect(formatted).toContain('<text><tspan x="0">Multi</tspan><tspan x="0" dy="1em">line</tspan></text>')
    // sibling elements outside text content got their own lines
    expect(formatted).toContain('</text>\n<rect')
    // the attribute value is intact after formatting
    const { JSDOM } = await import('jsdom')
    const reparsed = new JSDOM(formatted, { contentType: 'image/svg+xml' }).window.document
    expect(reparsed.documentElement.getAttribute('data-note')).toBe('a >< b')
  })
})
