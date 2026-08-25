/** The headless primitive used the way an SSR consumer would: hand-written
 * Unovis code, no chart spec involved. */
import { describe, expect, it } from 'vitest'

import { renderToSvg } from '../src/headless.js'

interface Point { x: number; y: number }

const data: Point[] = [{ x: 0, y: 10 }, { x: 1, y: 35 }, { x: 2, y: 20 }, { x: 3, y: 48 }]

describe('renderToSvg', () => {
  it('renders a chart built with plain Unovis code', async () => {
    const { svg, width, warnings } = await renderToSvg({ width: 800, height: 400, title: 'SSR chart' }, (ctx) => {
      const line = new ctx.unovis.Line<Point>({ x: d => d.x, y: d => d.y, duration: 0 })
      return new ctx.unovis.XYContainer<Point>(ctx.container, {
        components: [line],
        xAxis: new ctx.unovis.Axis<Point>({ duration: 0 }),
        yAxis: new ctx.unovis.Axis<Point>({ duration: 0 }),
        width: ctx.width,
        height: ctx.height,
        duration: 0,
        onRenderComplete: ctx.onRenderComplete,
      }, data)
    })

    expect(width).toBe(800)
    expect(warnings).toEqual([])
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('>SSR chart</text>') // synthesized header
    expect(svg).toMatch(/<path[^>]+d="M[\d.,\sCLH-]+"/) // the line itself
    expect(svg).not.toContain('var(') // standalone: variables baked
  })

  it('explains itself when onRenderComplete is not wired', async () => {
    await expect(renderToSvg({ width: 400, height: 300 }, (ctx) => {
      const line = new ctx.unovis.Line<Point>({ x: d => d.x, y: d => d.y, duration: 0 })
      // Deliberately omitting onRenderComplete
      return new ctx.unovis.XYContainer<Point>(ctx.container, {
        components: [line], width: ctx.width, height: ctx.height, duration: 0,
      }, data)
    })).rejects.toThrow(/onRenderComplete never fired/)
  })

  it('honours theme, palette and custom padding', async () => {
    const { svg } = await renderToSvg({
      width: 400,
      height: 300,
      theme: 'dark',
      colors: ['#abcdef'],
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    }, (ctx) => {
      const line = new ctx.unovis.Line<Point>({ x: d => d.x, y: d => d.y, duration: 0 })
      return new ctx.unovis.XYContainer<Point>(ctx.container, {
        components: [line], width: ctx.width, height: ctx.height, duration: 0, onRenderComplete: ctx.onRenderComplete,
      }, data)
    })
    expect(svg).toContain('#abcdef')
    expect(svg).toContain('background-color: rgb(41, 43, 52)')
    expect(svg).toContain('translate(0,0)') // zero padding honoured
  })
})
