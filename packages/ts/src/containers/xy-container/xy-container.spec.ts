import { describe, expect, it } from 'vitest'
import { XYContainer } from '@/containers/xy-container'
import { Area } from '@/components/area'
import { Line } from '@/components/line'
import { StackedBar } from '@/components/stacked-bar'
import { Crosshair } from '@/components/crosshair'

type Datum = { x: number; a: number; b: number; c: number }
type XYContainerInternals = { _render: (duration?: number) => void }

describe('XYContainer', () => {
  it('passes the Crosshair one color key per circle, stacked first', () => {
    const data: Datum[] = [{ x: 0, a: 1, b: 2, c: 3 }, { x: 1, a: 2, b: 3, c: 4 }]
    const crosshair = new Crosshair<Datum>()
    const container = new XYContainer<Datum>(document.createElement('div'), {
      components: [
        new Line<Datum>({ x: d => d.x, y: d => d.c, colorKeys: ['c'] }),
        new Area<Datum>({ x: d => d.x, y: [d => d.a, d => d.b] }),
        new Line<Datum>({ x: d => d.x, y: [d => d.a, d => d.b], colorKeys: ['d'] }),
      ],
      crosshair,
    }, data) as unknown as XYContainerInternals

    container._render(0)
    expect(crosshair.colorKeys).toEqual([undefined, undefined, 'c', 'd', undefined])
  })

  it('passes the StackedBar baseline to the Crosshair', () => {
    const data: Datum[] = [{ x: 0, a: 1, b: 2, c: 3 }, { x: 1, a: -2, b: 3, c: 4 }]
    const baseline = (d: Datum): number => d.b
    const crosshair = new Crosshair<Datum>()
    const container = new XYContainer<Datum>(document.createElement('div'), {
      components: [new StackedBar<Datum>({ x: d => d.x, y: d => d.a, baseline })],
      crosshair,
    }, data) as unknown as XYContainerInternals

    container._render(0)
    expect(crosshair.accessors.baseline).toBe(baseline)
  })
})
