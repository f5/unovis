import React, { useMemo, useState } from 'react'
import { scaleTime } from 'd3-scale'
import { areaY, defineChart } from '@tanstack/charts'
import { crosshair } from '@tanstack/charts/crosshair'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { Chart } from '@tanstack/charts/react'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import { DataRecord, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)

export default function TanStackAreaChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(labels)

  const definition = useMemo(() => {
    // Areas stack by the color channel, so the records are unpivoted into one row per month and service
    const rows = data.flatMap(d => series.map(s => ({ date: d.date, series: s.label, value: d[s.key] })))

    return defineChart({
      marks: [
        areaY(rows, { x: 'date', y: 'value', color: 'series' }),
        crosshair({ y: false }),
      ],
      scales: {
        x: { scale: scaleTime, axis: { ticks: { format: formatMonth } } },
        y: { scale: scaleLinear, grid: true, axis: { ticks: { format: formatValue } } },
      },
      color: {
        // The legend reports the next set of visible series; the component keeps it in state. A hidden series is removed
        // after stacking, so the other layers and the y axis stay where they are
        legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
      },
      // One tooltip row per series for the month nearest to the pointer, anywhere in the plot
      focus: 'group-x',
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        sort: 'color-domain',
        items: [
          { channel: 'x', text: p => formatMonth(p.xValue) },
          { channel: 'y', text: p => formatValue(p.yValue) },
        ],
      },
      svgAnimation: true,
    })
  }, [data, visible])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Monthly cloud spend by service"/>
}
