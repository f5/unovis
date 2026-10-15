import { describe, expect, it } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { getNearest2D } from '@/utils/data'

type Datum = { x: number; a: number }

describe('getNearest2D', () => {
  it('reads the stacked values with the datum index', () => {
    const data: Datum[] = [{ x: 0, a: 1 }, { x: 1, a: 2 }, { x: 2, a: 3 }]
    const scale = scaleLinear()
    const yStacked = [(d: Datum, i: number) => i === 2 ? d.a : undefined]

    const nearest = getNearest2D(data, [2, 3], scale, scale, d => d.x, [], yStacked)
    expect(nearest?.index).toBe(2)
  })
})
