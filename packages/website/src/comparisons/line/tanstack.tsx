import React, { useMemo, useState } from 'react'
import { scaleTime } from 'd3-scale'
import { crosshair, defineChart, lineY } from '@tanstack/charts'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { Chart } from '@tanstack/charts/react'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import { DataRecord, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)

export default function TanStackLineChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(labels)

  const definition = useMemo(() => {
    // TanStack Charts draws one line per color from tidy (long) data, so the wide records are unpivoted
    const rows = data.flatMap(d => series.map(s => ({ date: d.date, platform: s.label, users: d[s.key] })))

    return defineChart({
      marks: [
        // Missing months leave gaps: undefined values break the line
        lineY(rows, { x: 'date', y: 'users', color: 'platform' }),
        crosshair({ y: false }),
      ],
      scales: {
        // The compact scales cover numbers and categories; dates take D3's time scale
        x: { scale: scaleTime, axis: { ticks: { format: formatMonth } } },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { format: formatValue } } },
      },
      color: {
        // The legend proposes the next set of visible series; the component keeps it in state. Hidden series stay in the y domain
        legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
      },
      // One tooltip row per series for the month nearest to the pointer, anywhere in the plot
      focus: 'group-x',
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        sort: 'color-domain',
        // A series with no data in the hovered month has no point, so it gets no row
        items: [
          { channel: 'x', label: 'Month', text: p => formatMonth(p.xValue) },
          { channel: 'y', label: 'Users', text: p => formatValue(p.yValue) },
        ],
      },
      svgAnimation: true,
    })
  }, [data, visible])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Monthly active users by platform"/>
}
