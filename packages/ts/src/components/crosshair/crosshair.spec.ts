import { describe, expect, it } from 'vitest'
import { Crosshair } from '@/components/crosshair'
import { CrosshairCircle } from '@/components/crosshair/types'
import { CrosshairConfigInterface } from '@/components/crosshair/config'

type Datum = { x: number; a: number; b: number; c: number }
type CrosshairInternals = { getCircleData: (datum: Datum, datumIndex: number) => CrosshairCircle[] }

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
