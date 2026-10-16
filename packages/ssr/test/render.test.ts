/** The headless primitive used the way an SSR consumer would: hand-written
 * Unovis code, no chart spec involved. */
import { describe, expect, it } from 'vitest'

import { renderToSvg } from '../src/headless.js'

interface Point { x: number; y: number }

const data: Point[] = [{ x: 0, y: 10 }, { x: 1, y: 35 }, { x: 2, y: 20 }, { x: 3, y: 48 }]

describe('renderToSvg', () => {
  it.each(['Area', 'StackedBar', 'GroupedBar'] as const)('renders %s gradient defaults in the server environment', async (name) => {
    const { svg, warnings } = await renderToSvg({ width: 400, height: 300 }, (ctx) => {
      const component = new ctx.unovis[name]<Point>({ x: d => d.x, y: d => d.y, gradient: true, duration: 0 })
      return new ctx.unovis.XYContainer<Point>(ctx.container, {
        components: [component], width: ctx.width, height: ctx.height, duration: 0, onRenderComplete: ctx.onRenderComplete,
      }, data)
    })

    expect(warnings).toEqual([])
    expect(svg).toContain('<linearGradient')
    const gradientId = svg.match(/<linearGradient id="([^"]+)"/)?.[1]
    expect(svg).toContain(`fill: url(#${gradientId})`)
    const opacities = Array.from(svg.matchAll(/stop-opacity: ([\d.]+)/g), match => Number(match[1]))
    expect(opacities).toEqual(name === 'Area' ? [0.5, 0.1] : [0.85, 0.5])
    expect(svg).not.toContain('var(')
  })

  it('renders Sankey gradients with the default CSS colors', async () => {
    const { svg, warnings } = await renderToSvg({ width: 400, height: 300 }, (ctx) => {
      const sankey = new ctx.unovis.Sankey({ nodeGradient: true, linkGradient: true, duration: 0 })
      return new ctx.unovis.SingleContainer(ctx.container, {
        component: sankey, width: ctx.width, height: ctx.height, duration: 0, onRenderComplete: ctx.onRenderComplete,
      }, { nodes: [{ id: 'source' }, { id: 'target' }], links: [{ source: 'source', target: 'target', value: 1 }] })
    })

    expect(warnings).toEqual([])
    expect(svg).toMatch(/<linearGradient[^>]+y2="1"/)
    expect(svg).toMatch(/<linearGradient[^>]+x2="1"/)
    expect(svg).toContain('stop-opacity: 0.75')
    expect(svg).not.toContain('var(')
  })

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
