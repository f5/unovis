import React, { useMemo } from 'react'
import { Chart } from '@tanstack/charts/react'
import { boxY, defineChart } from '@tanstack/charts'
import type { BoxDatum, BoxSummaryDatum } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, formatMs } from './data'

type Row = { endpoint: string; value: number }
type Point = { datum: BoxDatum<Row, string> }
type TooltipItem = { id: string; label: string; text: (point: Point) => string | null }

// Each tooltip row reads a statistic of the hovered box; an outlier dot shows its own value
const stat = (label: string, read: (d: BoxSummaryDatum<Row, string>) => number): TooltipItem => ({
  id: label,
  label,
  text: ({ datum }: Point) => datum.kind === 'summary' ? formatMs(read(datum)) : null,
})

export default function TanStackBoxPlot ({ data }: ChartProps<DataRecord[]>): JSX.Element {
  const definition = useMemo(() => {
    // `boxY` computes the statistics from one row per sample, with Tukey whiskers and outlier dots
    const rows = data.flatMap(d => d.samples.map(value => ({ endpoint: d.endpoint, value })))
    return defineChart({
      marks: [boxY(rows, { x: 'endpoint', y: 'value' })],
      scales: {
        // The band scale has no padding by default, which would make the boxes touch
        x: { scale: () => scaleBand<string>().padding(0.2) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { format: formatMs } } },
      },
      tooltip: {
        use: tooltip,
        items: [
          { channel: 'x', label: 'Endpoint' },
          stat('Upper whisker', d => d.whiskerHigh),
          stat('Q3', d => d.q3),
          stat('Median', d => d.median),
          stat('Q1', d => d.q1),
          stat('Lower whisker', d => d.whiskerLow),
          { id: 'outlier', label: 'Outlier', text: ({ datum }: Point) => datum.kind === 'outlier' ? formatMs(datum.value) : null },
        ],
      },
      svgAnimation: true,
    })
  }, [data])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="API response times by endpoint"/>
}
