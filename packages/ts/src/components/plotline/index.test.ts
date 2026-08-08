import { describe, expect, it } from 'vitest'

import { LabelOverflow } from '../../types/plot-label'
import { Plotline } from './index'
import { PlotlineLabelPosition } from './types'

/**
 * Build a Plotline and inject the layout bounds the way `_render()` would,
 * without going through scale wiring (xScale/yScale are getters managed by
 * XYComponentCore + a real container). `getLabelLayoutInfo()` only depends
 * on config + cached `_labelLayoutBounds`, so this is enough.
 */
function makePlotline (overrides: Record<string, unknown> = {}): Plotline<unknown> {
  const p = new Plotline<unknown>({
    value: 50,
    labelText: 'p95',
    labelPosition: PlotlineLabelPosition.TopRight,
    ...overrides,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(p as any)._labelLayoutBounds = { width: 400, height: 100 }
  return p
}

describe('Plotline.getLabelLayoutInfo', () => {
  it('returns null when there is no label text', () => {
    const p = makePlotline({ labelText: undefined })
    expect(p.getLabelLayoutInfo()).toBeNull()
  })

  it('returns null before _render has cached bounds', () => {
    const p = new Plotline<unknown>({ value: 50, labelText: 'x' })
    expect(p.getLabelLayoutInfo()).toBeNull()
  })

  it('preferredAnchor + candidates start with the configured labelPosition', () => {
    const p = makePlotline({
      labelPosition: PlotlineLabelPosition.BottomLeft,
      labelAutoPosition: true,
    })
    const info = p.getLabelLayoutInfo()
    expect(info).not.toBeNull()
    expect(info!.preferredAnchor).toBe(PlotlineLabelPosition.BottomLeft)
    expect(info!.candidates[0]).toBe(PlotlineLabelPosition.BottomLeft)
    expect(info!.candidates).toHaveLength(8)
    expect(new Set(info!.candidates).size).toBe(8) // no duplicates
  })

  it('participatesInAuto reflects labelAutoPosition', () => {
    expect(makePlotline({ labelAutoPosition: false }).getLabelLayoutInfo()!.participatesInAuto).toBe(false)
    expect(makePlotline({ labelAutoPosition: true }).getLabelLayoutInfo()!.participatesInAuto).toBe(true)
  })

  it('overflow defaults to BestEffort and respects override', () => {
    expect(makePlotline().getLabelLayoutInfo()!.overflow).toBe(LabelOverflow.Smart)
    expect(makePlotline({ labelOverflow: LabelOverflow.Hide }).getLabelLayoutInfo()!.overflow).toBe(LabelOverflow.Hide)
  })

  it('computeLayout returns different coords for different anchors', () => {
    const p = makePlotline({ labelPosition: PlotlineLabelPosition.TopRight })
    const info = p.getLabelLayoutInfo()!
    const layoutPreferred = info.computeLayout(info.preferredAnchor)
    const layoutOther = info.computeLayout(PlotlineLabelPosition.BottomLeft)
    expect(layoutPreferred.x !== layoutOther.x || layoutPreferred.y !== layoutOther.y).toBe(true)
    expect(layoutPreferred).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      transform: expect.any(String),
      textAnchor: expect.any(String),
      dominantBaseline: expect.any(String),
    })
  })
})
