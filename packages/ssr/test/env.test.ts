import { describe, expect, it } from 'vitest'

import { getRenderEnv, defineElementSize } from '../src/env/index.js'

describe('render env', () => {
  it('imports @unovis/ts with emotion styles inserted into jsdom', async () => {
    const env = await getRenderEnv()
    expect(env.lib.XYContainer).toBeDefined()
    expect(env.lib.Heatmap).toBeDefined()
    const styleTags = env.document.querySelectorAll('style')
    expect(styleTags.length).toBeGreaterThan(0)
    expect(env.varMaps.light.get('--vis-color0')).toBe('#4D8CFD')
    // Deliberately biased above the library's 0.5 default — see env/index.ts
    expect(env.varMaps.light.get('--vis-font-wh-ratio')).toBe('0.58')
    // Dark map entries may hold var() references — they resolve through the light map
    expect(env.varMaps.dark.has('--vis-color5')).toBe(true)
  })

  it('renders a line chart with axes synchronously via the rAF queue', async () => {
    const env = await getRenderEnv()

    const data = Array.from({ length: 12 }, (_, i) => ({ x: i, y: Math.sin(i / 2) * 40 + 50 }))
    const host = env.document.createElement('div')
    defineElementSize(host, 800, 480)
    env.document.body.appendChild(host)

    type Datum = { x: number; y: number }
    let renderComplete = false
    const line = new env.lib.Line<Datum>({ x: d => d.x, y: d => d.y, duration: 0 })
    const chart = new env.lib.XYContainer<Datum>(host, {
      components: [line],
      xAxis: new env.lib.Axis<Datum>({ label: 'Month', duration: 0 }),
      yAxis: new env.lib.Axis<Datum>({ label: 'Revenue', duration: 0 }),
      width: 800,
      height: 480,
      duration: 0,
      onRenderComplete: () => { renderComplete = true },
    }, data)

    env.raf.flushAll()
    expect(renderComplete).toBe(true)
    expect(env.raf.errors).toEqual([])

    const svg = host.querySelector('svg') as SVGSVGElement
    expect(svg).toBeTruthy()
    expect(svg.getAttribute('width')).toBe('800')

    const linePath = svg.querySelector('[class*="line"] path[d^="M"]')
    expect(linePath).toBeTruthy()

    const texts = Array.from(svg.querySelectorAll('text')).map(t => t.textContent)
    expect(texts).toContain('Month')
    expect(texts).toContain('Revenue')
    expect(texts.length).toBeGreaterThan(6)

    // Auto-margin must have shifted the axis by a measured tick-label width
    const axisGroup = svg.querySelector('[class*="axis-component"]')
    expect(axisGroup?.getAttribute('transform')).toMatch(/translate\(\d+/)

    chart.destroy()
    host.remove()
    env.raf.clear()
  })

  it('measures text through the canvas hook', async () => {
    const env = await getRenderEnv()
    const canvas = env.document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    expect(ctx).toBeTruthy()
    const width = ctx!.measureText('hello world').width
    expect(width).toBeGreaterThan(10)
  })

  it('resolves --vis-* variables through getComputedStyle', async () => {
    const env = await getRenderEnv()
    const el = env.document.createElement('div')
    env.document.body.appendChild(el)
    const resolved = env.window.getComputedStyle(el).getPropertyValue('--vis-color1')
    expect(resolved).toBe('#FF6B7E')
    const ratio = env.window.getComputedStyle(env.document.body).getPropertyValue('--vis-font-wh-ratio')
    expect(parseFloat(ratio)).toBe(0.58)
    el.remove()
  })
})
