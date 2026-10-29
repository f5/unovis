import { describe, expect, it } from 'vitest'

// Core
import { Crosshair } from '@/components/crosshair'

// Types
import { ScaleDimension } from '@/types/scale'
import { CrosshairCircle } from '@/components/crosshair/types'

// Config
import { CrosshairConfigInterface } from '@/components/crosshair/config'

type Datum = { x: number; a: number; b: number; c: number | undefined }
type CrosshairInternals = {
  getCircleData: (datum: Datum, datumIndex: number) => CrosshairCircle[];
  getPaintOrder: (circles: CrosshairCircle[]) => CrosshairCircle[];
}

const datum: Datum = { x: 5, a: 10, b: 20, c: 70 }
const datumIndex = 5
const colors = ['#3b82f6', '#f59e0b', '#10b981']

function getCircles (config: CrosshairConfigInterface<Datum>, colorKeys?: string[]): CrosshairCircle[] {
  const crosshair = new Crosshair<Datum>({
    x: d => d.x,
    yStacked: [d => d.a, d => d.b],
    y: [d => d.c],
    ...config,
  })
  if (colorKeys) crosshair.colorKeys = colorKeys
  return (crosshair as unknown as CrosshairInternals).getCircleData(datum, datumIndex)
}

describe('Crosshair circles with both `yStacked` and `y`', () => {
  it('passes the circle index to `color`, `strokeColor` and `strokeWidth` alike', () => {
    const circles = getCircles({
      color: (d, i) => colors[i],
      strokeColor: (d, i) => colors[i],
      strokeWidth: (d, i) => i + 1,
    })

    expect(circles.map(c => c.color)).toEqual(colors)
    expect(circles.map(c => c.strokeColor)).toEqual(colors)
    expect(circles.map(c => c.strokeWidth)).toEqual([1, 2, 3])
  })

  it('looks up the stroke color key by the circle index', () => {
    const circles = getCircles({
      color: 'none',
      strokeColor: (d, i, key) => key,
    }, ['a', 'b', 'c'])

    expect(circles.map(c => c.strokeColor)).toEqual(['a', 'b', 'c'])
  })

  it('reads the stacked values with the datum index', () => {
    const circles = getCircles({
      yStacked: [(d, i) => i === datumIndex ? d.a : undefined, (d, i) => i === datumIndex ? d.b : undefined],
    })

    expect(circles.map(c => c.opacity)).toEqual([1, 1, 1])
  })
})

describe('Crosshair circles paint order', () => {
  const paintOrder = (d: Pick<Datum, 'a' | 'b' | 'c'>, yMax = 2000): string[] => {
    const crosshair = new Crosshair<Datum>({ x: d => d.x, yStacked: [d => d.a, d => d.b], y: [d => d.c], circleRadius: 5 })
    crosshair.setScaleDomain(ScaleDimension.Y, [0, yMax])
    crosshair.setScaleRange(ScaleDimension.Y, [300, 0])
    const internals = crosshair as unknown as CrosshairInternals
    const circles = internals.getCircleData({ x: 0, ...d }, 0)
    return internals.getPaintOrder(circles).map(c => c.id)
  }

  it('paints a thick segment over a thin one stacked on top of it', () => {
    expect(paintOrder({ a: 1600, b: 3, c: undefined })).toEqual(['stacked-1', 'stacked-0'])
  })

  it('paints the largest of the tiny segments near zero last', () => {
    expect(paintOrder({ a: 0.01, b: 0.03, c: 0.02 })).toEqual(['stacked-0', 'regular-0', 'stacked-1'])
  })

  it('keeps the order when the circles do not overlap', () => {
    expect(paintOrder({ a: 100, b: 700, c: 1500 })).toEqual(['stacked-0', 'stacked-1', 'regular-0'])
  })

  it('does not reorder the circles returned by `getCircleData`', () => {
    const crosshair = new Crosshair<Datum>({ x: d => d.x, yStacked: [d => d.a, d => d.b], y: [d => d.c], circleRadius: 5 })
    crosshair.setScaleDomain(ScaleDimension.Y, [0, 2000])
    crosshair.setScaleRange(ScaleDimension.Y, [300, 0])
    const circles = (crosshair as unknown as CrosshairInternals).getCircleData({ x: 0, a: 1600, b: 3, c: 1599 }, 0)
    expect(circles.map(c => c.id)).toEqual(['stacked-0', 'stacked-1', 'regular-0'])
  })
})

describe('Crosshair bleed', () => {
  const crosshair = new Crosshair<Datum>({ x: d => d.x, y: [d => d.a], circleRadius: 5 })

  it('requests the circle radius on the sides without container margin', () => {
    crosshair.setContainerMargin({ top: 0, bottom: 0, left: 0, right: 0 })
    expect(crosshair.bleed).toEqual({ top: 5, left: 5, right: 5 })
  })

  it('skips the bleed on the sides covered by the container margin', () => {
    crosshair.setContainerMargin({ top: 2, bottom: 20, left: 40, right: 0 })
    expect(crosshair.bleed).toEqual({ top: 3, left: 0, right: 5 })
  })
})
