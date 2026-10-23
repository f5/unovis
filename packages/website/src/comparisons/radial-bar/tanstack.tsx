import React, { useMemo, useState } from 'react'
import { defineChart } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { decorative } from '@tanstack/charts/mark/decorative'
import { polar, radialBarAngle, radialText, PolarLayoutContext, PolarOptions } from '@tanstack/charts/polar'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'

import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, resources, formatUsage, percentOfQuota, formatAverageUsage } from './data'

const labels = resources.map(r => r.label)

export default function TanStackRadialBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(labels)

  const definition = useMemo(() => {
    const gauge = preset === 'gauge'
    // The rings are the bands of a radius scale, laid out in pixels from the outer edge inward: 16 px rings with 4 px gaps
    // (28 and 4 px for the thick rings), so the band padding is the gap's share of a ring plus its gap
    const ringWidth = preset === 'thick' ? 28 : 16
    const ringGap = 4
    const rings = labels.length * ringWidth + (labels.length - 1) * ringGap
    const cornerRadius = preset === 'rounded' ? 'full' : 0
    const layout: Omit<PolarOptions, 'marks'> = {
      // Radians, clockwise from 12 o'clock
      startAngle: gauge ? -0.75 * Math.PI : 0,
      endAngle: gauge ? 0.75 * Math.PI : 2 * Math.PI,
      scales: {
        // One angle scale for every ring, so the values are percent of the quota
        angle: { scale: scaleLinear().domain([0, 100]) },
        // The reversed range puts the first record on the outer ring
        radius: {
          scale: scaleBand<string>().domain(labels).paddingInner(ringGap / (ringWidth + ringGap)).paddingOuter(0),
          range: [({ radius }: PolarLayoutContext) => radius, ({ radius }: PolarLayoutContext) => Math.max(radius - rings, 0)],
        },
      },
    }
    // The interactive legend doesn't hide polar marks by itself, so the hidden resources are filtered out here
    const bars = data.filter(d => visible.includes(d.label))
    // radialText places its anchor through angle and radius scales, so the center label gets fixed ones
    const unit = { scale: scaleLinear().domain([0, 1]) }

    return defineChart({
      marks: [
        // A track behind every ring, as in the Unovis chart. It's a second polar layer without interaction, so hovering it
        // doesn't focus the track. `currentColor` follows the site's theme
        decorative(polar({
          ...layout,
          marks: [radialBarAngle(data, { radius: 'label', angle1: 0, angle2: 100, cornerRadius, fill: 'currentColor', fillOpacity: 0.1 })],
        })),
        polar({
          ...layout,
          marks: [radialBarAngle(bars, { radius: 'label', angle: percentOfQuota, key: 'key', cornerRadius, color: 'label' })],
        }),
        // `decorative` keeps the label from becoming a hover and keyboard target
        decorative(polar({
          marks: [
            radialText([formatAverageUsage(data)], { angle: 0, radius: 0, dy: -9, fontSize: 20, fontWeight: 700 }),
            radialText(['of the quotas used'], { angle: 0, radius: 0, dy: 12, fontSize: 12 }),
          ],
          scales: { angle: unit, radius: unit },
        })),
      ],
      scales: { x: null, y: null },
      color: { domain: labels, legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }) },
      tooltip: {
        use: tooltip,
        content: ([point]) => ({ title: point.datum.label, rows: [{ label: 'Used', value: formatUsage(point.datum), color: point.color }] }),
      },
      svgAnimation: true,
    })
  }, [data, visible, preset])

  return <Chart definition={definition} height={COMPARISON_TALL_CHART_HEIGHT} ariaLabel="Usage of five plan quotas"/>
}
