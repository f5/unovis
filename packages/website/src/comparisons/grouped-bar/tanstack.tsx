import React, { useMemo, useState } from 'react'
import { Chart } from '@tanstack/charts/react'
import { barX, barY, defineChart, group } from '@tanstack/charts'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

export default function TanStackGroupedBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visibleYears, setVisibleYears] = useState<readonly string[]>(series.map(s => s.label))

  const definition = useMemo(() => {
    // TanStack Charts draws one bar per row, so the records are unpivoted into one row per region and year
    const rows = data.flatMap(d => series.map(s => ({ region: d.region, year: s.label, value: d[s.key] })))
    const horizontal = preset === 'horizontal'
    // The band scale has no padding by default, which would make the groups touch
    const regionScale = { scale: () => scaleBand<string>().padding(0.2) }
    const valueScale = { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { format: formatValue } } }
    return defineChart({
      marks: [
        // Repeated category values stack by default, `group()` puts them side by side. `barX` is the horizontal `barY`
        horizontal
          ? barX(rows, { y: 'region', x: 'value', color: 'year', layout: group() })
          : barY(rows, { x: 'region', y: 'value', color: 'year', layout: group() }),
      ],
      scales: horizontal ? { y: regionScale, x: valueScale } : { x: regionScale, y: valueScale },
      // The library's legend toggles the years; the list of visible ones is React state
      color: { legend: interactiveColorLegend({ visible: controlledSignal(visibleYears, setVisibleYears) }) },
      // One tooltip per region: the hovered bar's group
      focus: horizontal ? 'group-y' : 'group-x',
      tooltip: {
        use: tooltip,
        // The axis tick format doesn't carry into the tooltip, and its rows are sorted by bar height unless told otherwise
        items: [horizontal ? { channel: 'x', text: point => formatValue(point.xValue) } : { channel: 'y', text: point => formatValue(point.yValue) }],
        sort: 'color-domain',
      },
      svgAnimation: true,
    })
  }, [data, preset, visibleYears])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Annual revenue by region"/>
}
