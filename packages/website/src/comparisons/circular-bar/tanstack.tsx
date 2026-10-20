import React, { useMemo, useState } from 'react'
import { defineChart } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { decorative } from '@tanstack/charts/mark/decorative'
import { polar, radialBarRadius, PolarOptions } from '@tanstack/charts/polar'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'

import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, metrics, formatValue, percentOfGoal } from './data'

const labels = metrics.map(m => m.label)

export default function TanStackCircularBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(labels)

  const definition = useMemo(() => {
    const half = preset === 'half'
    const cornerRadius = preset === 'square' ? 0 : 10
    const layout: Omit<PolarOptions, 'marks'> = {
      // The first band starts at `startAngle`; half a slot back centers it at the top
      startAngle: half ? -Math.PI / 2 : -Math.PI / labels.length,
      endAngle: half ? Math.PI / 2 : 2 * Math.PI - Math.PI / labels.length,
      scales: {
        // The padding is a share of the band's angle, so the gaps widen towards the outer edge
        angle: { scale: scaleBand<string>().domain(labels).padding(preset === 'gaps' ? 0.4 : 0.15) },
        // One radius scale for every bar, so the values are percent of the goal. The range starts at the hole's radius
        radius: { scale: scaleLinear().domain([0, 100]), range: [({ radius }) => radius * 0.28, ({ radius }) => radius] },
      },
    }
    // The interactive legend doesn't hide polar marks by itself, so the hidden metrics are filtered out here
    const bars = data.filter(d => visible.includes(d.label))

    return defineChart({
      marks: [
        // A track behind every bar, as in the Unovis and ECharts charts. It's a second polar layer without interaction,
        // so hovering it doesn't focus the track. `currentColor` follows the site's theme
        decorative(polar({
          ...layout,
          marks: [radialBarRadius(data, { angle: 'label', radius1: 0, radius2: 100, cornerRadius, fill: 'currentColor', fillOpacity: 0.1 })],
        })),
        polar({
          ...layout,
          // Without `radius1` the bars would start at the center instead of the hole
          marks: [radialBarRadius(bars, { angle: 'label', radius1: 0, radius2: percentOfGoal, key: 'key', cornerRadius, color: 'label' })],
        }),
      ],
      scales: { x: null, y: null },
      color: { domain: labels, legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }) },
      tooltip: {
        use: tooltip,
        content: ([point]) => ({ title: point.datum.label, rows: [{ label: 'Today', value: formatValue(point.datum), color: point.color }] }),
      },
      svgAnimation: true,
    })
  }, [data, visible, preset])

  return <Chart definition={definition} height={COMPARISON_TALL_CHART_HEIGHT} ariaLabel="Progress towards six daily goals"/>
}
