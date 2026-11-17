import { describe, expect, it, vi } from 'vitest'

import { AxisType } from '@/components/axis/types'
import { Plotband } from '@/components/plotband'
import { PlotbandLabelPosition } from '@/components/plotband/types'
import { XYContainer } from '@/containers/xy-container'
import * as textMeasure from '@/utils/text-measure'
import { Plotline } from './index'
import { PlotlineLabelPosition } from './types'

describe.each(['line', 'band'] as const)('Plot%s label overflow', (kind) => {
  it('uses the chart margin only when enabled and keeps the geometry clipped', async () => {
    const measure = vi.spyOn(textMeasure, 'getPreciseStringLengthPx').mockReturnValue(30)
    const host = document.createElement('div')
    document.body.append(host)
    const config = { axis: AxisType.X, labelText: 'Today', labelOffsetY: -24 }
    const mark = kind === 'line'
      ? new Plotline({ ...config, value: 5, labelPosition: PlotlineLabelPosition.Top })
      : new Plotband({ ...config, from: 4, to: 6, labelPosition: PlotbandLabelPosition.TopOutside })
    const geometry = mark instanceof Plotline ? mark.plotline.node() : mark.plotband.node()
    const geometryGroup = geometry.parentElement
    const chart = new XYContainer(host, {
      components: [mark],
      width: 400,
      height: 200,
      xDomain: [0, 10],
      margin: { top: 32 },
    })

    function setOverflow (labelAllowOverflow: boolean, labelOffsetY: number): void {
      if (mark instanceof Plotline) mark.setConfig({ ...mark.config, labelAllowOverflow, labelOffsetY })
      else mark.setConfig({ ...mark.config, labelAllowOverflow, labelOffsetY })
    }

    try {
      await chart.render(0)
      const clip = mark.element.style.clipPath
      const transform = mark.labelGroup.attr('transform')
      expect(clip).toMatch(/^url\(/)
      expect(transform).toBe('translate(200,0) rotate(0)')

      setOverflow(true, -24)
      await chart.render(0)
      expect(mark.labelGroup.attr('transform')).toBe('translate(200,-24) rotate(0)')
      expect(mark.element.style.clipPath).toBe('')
      expect(geometryGroup.style.clipPath).toBe(clip)

      setOverflow(true, -48)
      await chart.render(0)
      expect(mark.labelGroup.attr('transform')).toBe('translate(200,-32) rotate(0)')

      setOverflow(false, -24)
      await chart.render(0)
      expect(mark.labelGroup.attr('transform')).toBe(transform)
      expect(mark.element.style.clipPath).toBe(clip)
      expect(geometryGroup.style.clipPath).toBe('')
    } finally {
      chart.destroy()
      host.remove()
      measure.mockRestore()
    }
  })
})
