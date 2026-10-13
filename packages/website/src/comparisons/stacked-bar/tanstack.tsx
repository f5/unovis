import React, { useMemo, useState } from 'react'
import { barY, crosshair, defineChart } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import { DataRecord, series, formatValue } from './data'

export default function TanStackStackedBarChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(series.map(s => s.label))

  const definition = useMemo(() => {
    // TanStack Charts stacks tidy data, one row per bar segment, in the order of the rows. Its legend hides a series after
    // stacking, so the other segments keep their places and the y axis its range
    const rows = data.flatMap(d => series.map(s => ({ month: d.month, priority: s.label, tickets: d[s.key] })))
    return defineChart({
      marks: [
        // A band behind the hovered stack
        crosshair({ x: { band: true }, y: false }),
        barY(rows, { x: 'month', y: 'tickets', color: 'priority' }),
      ],
      scales: {
        // The band scale has no padding by default, the bars would touch
        x: { scale: () => scaleBand<string>().padding(0.1) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { format: formatValue } } },
      },
      color: {
        // The domain keeps the hidden series in the legend
        domain: series.map(s => s.label),
        legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
      },
      // One tooltip for the whole stack: the hovered month's segments
      focus: 'group-x',
      tooltip: { use: tooltip, items: [{ channel: 'y', text: point => formatValue(point.yValue) }] },
      svgAnimation: true,
    })
  }, [data, visible])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Support tickets per month by priority"/>
}
