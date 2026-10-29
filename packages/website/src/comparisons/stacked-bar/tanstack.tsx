import React, { useMemo, useState } from 'react'
import { barX, barY, crosshair, defineChart, ruleY, text } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { decorative } from '@tanstack/charts/mark/decorative'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

const CAPACITY = 400

export default function TanStackStackedBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(series.map(s => s.label))

  const definition = useMemo(() => {
    // TanStack Charts stacks tidy data, one row per bar segment, in the order of the rows. Its legend hides a series after
    // stacking, so the other segments keep their places and the y axis its range
    const rows = data.flatMap(d => series.map(s => ({ month: d.month, priority: s.label, tickets: d[s.key] })))
    // The band scale has no padding by default, the bars would touch
    const monthScale = { scale: () => scaleBand<string>().padding(0.1) }
    const valueScale = { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { format: formatValue } } }
    const color = {
      // The domain keeps the hidden series in the legend
      domain: series.map(s => s.label),
      legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
    }

    if (preset === 'horizontal') {
      return defineChart({
        marks: [
          crosshair({ y: { band: true }, x: false }),
          barX(rows, { y: 'month', x: 'tickets', color: 'priority' }),
        ],
        scales: { x: valueScale, y: monthScale },
        color,
        focus: 'group-y',
        tooltip: { use: tooltip, items: [{ channel: 'x', text: point => formatValue(point.xValue) }] },
        svgAnimation: true,
      })
    }

    return defineChart({
      marks: [
        // A band behind the hovered stack
        crosshair({ x: { band: true }, y: false }),
        barY(rows, { x: 'month', y: 'tickets', color: 'priority' }),
        // A reference line is a rule mark, and its label a text mark placed over the last month. Text marks join the focus
        // like data, `decorative` keeps the label out of the tooltip
        ...(preset === 'capacity'
          ? [
            ruleY([CAPACITY], { strokeDasharray: '6 4' }),
            decorative(text([CAPACITY], { x: () => data[data.length - 1].month, y: d => d, text: () => `Capacity ${formatValue(CAPACITY)}`, anchor: 'end', dy: -8, fontSize: 12 })),
          ]
          : []),
      ],
      scales: { x: monthScale, y: valueScale },
      color,
      // One tooltip for the whole stack: the hovered month's segments
      focus: 'group-x',
      tooltip: { use: tooltip, items: [{ channel: 'y', text: point => formatValue(point.yValue) }] },
      svgAnimation: true,
    })
  }, [data, preset, visible])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Support tickets per month by priority"/>
}
