import React, { useMemo, useState } from 'react'
import { defineChart } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { decorative } from '@tanstack/charts/mark/decorative'
import { pie, polar, radialArc, radialText, PolarLayoutContext } from '@tanstack/charts/polar'
import { Chart } from '@tanstack/charts/react'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, sources, formatValue, getTotal } from './data'

export default function TanStackDonutChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(sources)

  const definition = useMemo(() => {
    // `pie` adds a `source` field of its own (the row each slice comes from), so the traffic source moves to `name`.
    // The interactive legend doesn't hide polar marks by itself, so a hidden source gets a zero value and the others close the ring
    const rows = data.map(d => ({ name: d.source, sessions: visible.includes(d.source) ? d.sessions : 0 }))
    // radialText places its anchor through angle and radius scales, so the center label gets fixed ones
    const unit = { scale: scaleLinear().domain([0, 1]) }
    const isHalf = preset === 'half'
    // There's no center option: the ring sits in the middle of the plot area, so the half ring moves down with a locked top
    // `margin` (see below) and gets a radius that reaches up to the top of the chart, or half the plot width when that's smaller
    const halfRadius = ({ centerY, chart }: PolarLayoutContext): number => Math.min(chart.width / 2, centerY)

    return defineChart({
      marks: [
        polar({
          marks: [radialArc(
            // Angles are in radians, clockwise from 12 o'clock
            pie(rows, {
              value: 'sessions',
              startAngle: isHalf ? -Math.PI / 2 : 0,
              endAngle: isHalf ? Math.PI / 2 : 2 * Math.PI,
              gapAngle: preset === 'rounded' ? 0.03 : 0,
            }),
            {
              innerRadius: isHalf ? layout => halfRadius(layout) * 0.6 : ({ radius }) => radius * 0.6,
              outerRadius: isHalf ? halfRadius : undefined,
              cornerRadius: preset === 'rounded' ? 6 : 0,
              color: 'name',
              key: 'name',
            }
          )],
          scales: { angle: null, radius: null },
        }),
        // `decorative` keeps the label from becoming a hover and keyboard target. Text without a `fontSize` inherits the
        // page's 16px, which overflows the hole once the legend wraps on a narrow card
        decorative(polar({
          marks: [
            radialText([formatValue(getTotal(data))], { angle: 0, radius: 0, dy: isHalf ? -30 : -9, fontSize: 20, fontWeight: 700 }),
            radialText(['Total sessions'], { angle: 0, radius: 0, dy: isHalf ? -9 : 12, fontSize: 12 }),
          ],
          scales: { angle: unit, radius: unit },
        })),
      ],
      // The bottom margin stays automatic, so it keeps making room for the legend
      margin: isHalf ? { top: 140 } : undefined,
      scales: { x: null, y: null },
      color: {
        // The legend reports the next set of visible sources; the component keeps it in state
        legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
      },
      tooltip: {
        use: tooltip,
        format: ({ datum }) => `${datum.name}: ${formatValue(datum.sessions)}`,
      },
      svgAnimation: true,
    })
  }, [data, visible, preset])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Website sessions by traffic source"/>
}
