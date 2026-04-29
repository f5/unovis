import { describe, expect, it } from 'vitest'

import { LabelOverflow } from '../../types/plot-label'
import { Plotband } from './index'
import { PlotbandLabelPosition } from './types'

function makePlotband (overrides: Record<string, unknown> = {}): Plotband<unknown> {
  const p = new Plotband<unknown>({
    from: 20,
    to: 80,
    labelText: 'range',
    labelPosition: PlotbandLabelPosition.TopLeftOutside,
    ...overrides,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(p as any)._labelLayoutBounds = { startX: 100, startY: 50, width: 300, height: 150 }
  return p
}

describe('Plotband.getLabelLayoutInfo', () => {
  it('returns null when there is no label text', () => {
    const p = makePlotband({ labelText: undefined })
    expect(p.getLabelLayoutInfo()).toBeNull()
  })

  it('returns null before _render has cached bounds', () => {
    const p = new Plotband<unknown>({ from: 0, to: 10, labelText: 'x' })
    expect(p.getLabelLayoutInfo()).toBeNull()
  })

  it('preferredAnchor + candidates start with the configured labelPosition', () => {
    const p = makePlotband({
      labelPosition: PlotbandLabelPosition.BottomRightInside,
      labelAutoPosition: true,
    })
    const info = p.getLabelLayoutInfo()
    expect(info).not.toBeNull()
    expect(info!.preferredAnchor).toBe(PlotbandLabelPosition.BottomRightInside)
    expect(info!.candidates[0]).toBe(PlotbandLabelPosition.BottomRightInside)
    expect(info!.candidates).toHaveLength(16)
    expect(new Set(info!.candidates).size).toBe(16) // no duplicates
  })

  it('participatesInAuto reflects labelAutoPosition', () => {
    expect(makePlotband({ labelAutoPosition: false }).getLabelLayoutInfo()!.participatesInAuto).toBe(false)
    expect(makePlotband({ labelAutoPosition: true }).getLabelLayoutInfo()!.participatesInAuto).toBe(true)
  })

  it('overflow defaults to BestEffort and respects override', () => {
    expect(makePlotband().getLabelLayoutInfo()!.overflow).toBe(LabelOverflow.Smart)
    expect(makePlotband({ labelOverflow: LabelOverflow.Hide }).getLabelLayoutInfo()!.overflow).toBe(LabelOverflow.Hide)
  })

  it('computeLayout returns different coords for different anchors', () => {
    const p = makePlotband({ labelPosition: PlotbandLabelPosition.TopLeftOutside })
    const info = p.getLabelLayoutInfo()!
    const layoutPreferred = info.computeLayout(info.preferredAnchor)
    const layoutAlt = info.computeLayout(PlotbandLabelPosition.BottomRightInside)
    expect(layoutPreferred.x !== layoutAlt.x || layoutPreferred.y !== layoutAlt.y).toBe(true)
  })
})
