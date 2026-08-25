/** PNG rasterization of renderToSvg output — the SSR pipeline end to end,
 * with no chart spec involved. */
import { describe, expect, it } from 'vitest'

import { renderToSvg } from '../src/headless.js'
import { svgToPng, themeBackground } from '../src/rasterize.js'

const renderLine = async (): Promise<string> => {
  const { svg } = await renderToSvg({ width: 400, height: 300, theme: 'dark' }, (ctx) => {
    const line = new ctx.unovis.Line<{ x: number; y: number }>({ x: d => d.x, y: d => d.y, duration: 0 })
    return new ctx.unovis.XYContainer(ctx.container, {
      components: [line],
      width: ctx.width,
      height: ctx.height,
      duration: 0,
      onRenderComplete: ctx.onRenderComplete,
    }, [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }])
  })
  return svg
}

describe('svgToPng', () => {
  it('rasterizes at the requested scale with an explicit background', async () => {
    const svg = await renderLine()
    const png = await svgToPng(svg, { width: 400, scale: 2, background: themeBackground('dark') })

    // PNG magic + IHDR width 800 (400 × 2)
    expect(png.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    expect(png.readUInt32BE(16)).toBe(800)
  })

  it('themeBackground returns literal colors, not variables', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(themeBackground(theme)).toMatch(/^#[0-9a-fA-F]{3,8}$/)
    }
  })
})
