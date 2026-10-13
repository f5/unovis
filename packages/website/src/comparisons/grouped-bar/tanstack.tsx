import React, { useMemo, useState } from 'react'
import { Chart } from '@tanstack/charts/react'
import { barY, defineChart, group } from '@tanstack/charts'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import { DataRecord, series, formatValue } from './data'

export default function TanStackGroupedBarChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const [visibleYears, setVisibleYears] = useState<readonly string[]>(series.map(s => s.label))

  const definition = useMemo(() => {
    // TanStack Charts draws one bar per row, so the records are unpivoted into one row per region and year
    const rows = data.flatMap(d => series.map(s => ({ region: d.region, year: s.label, value: d[s.key] })))
    return defineChart({
      marks: [
        // Repeated x values stack by default, `group()` puts them side by side
        barY(rows, { x: 'region', y: 'value', color: 'year', layout: group() }),
      ],
      scales: {
        // The band scale has no padding by default, which would make the groups touch
        x: { scale: () => scaleBand<string>().padding(0.2) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { format: formatValue } } },
      },
      // The library's legend toggles the years; the list of visible ones is React state
      color: { legend: interactiveColorLegend({ visible: controlledSignal(visibleYears, setVisibleYears) }) },
      // One tooltip per region: the hovered bar's x group
      focus: 'group-x',
      tooltip: {
        use: tooltip,
        // The axis tick format doesn't carry into the tooltip, and its rows are sorted by bar height unless told otherwise
        items: [{ channel: 'y', text: point => formatValue(point.yValue) }],
        sort: 'color-domain',
      },
      svgAnimation: true,
    })
  }, [data, visibleYears])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Annual revenue by region"/>
}
