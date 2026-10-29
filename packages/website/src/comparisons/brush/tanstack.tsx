import React, { useEffect, useMemo, useState } from 'react'
import { scaleTime } from 'd3-scale'
import { areaY, defineChart } from '@tanstack/charts'
import { crosshair } from '@tanstack/charts/crosshair'
import { brushX } from '@tanstack/charts/interaction/brush'
import type { BrushRange } from '@tanstack/charts/interaction/brush'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { Chart } from '@tanstack/charts/react'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { LAST_30_DAYS, READOUT_STYLE } from './constants'
import { DataRecord, formatDate, formatDay, formatMonth, formatSelection, formatValue } from './data'

const BRUSH_HEIGHT = 96

export default function TanStackBrushChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const fullYear = { start: data[0].date, end: data[data.length - 1].date }
  const [range, setRange] = useState<BrushRange<Date>>(fullYear)

  useEffect(() => {
    setRange(preset === 'window' ? { start: LAST_30_DAYS[0], end: LAST_30_DAYS[1] } : fullYear)
  }, [preset])

  const main = useMemo(() => defineChart({
    // The app filters the rows to the selected days and fixes the x domain to them
    marks: [
      areaY(data.filter(d => d.date >= range.start && d.date <= range.end), { x: 'date', y: 'requests' }),
      crosshair({ y: false }),
    ],
    scales: {
      x: { scale: scaleTime().domain([range.start, range.end]), axis: { ticks: { format: formatDay } } },
      y: { scale: scaleLinear, grid: true, axis: { ticks: { format: formatValue } } },
    },
    focus: 'group-x',
    maxFocusDistance: Number.POSITIVE_INFINITY,
    tooltip: {
      use: tooltip,
      items: [
        { channel: 'x', label: 'Day', text: p => formatDate(p.xValue) },
        { channel: 'y', label: 'Requests', text: p => formatValue(p.yValue) },
      ],
    },
  }), [data, range])

  const overview = useMemo(() => defineChart({
    marks: [areaY(data, { x: 'date', y: 'requests' })],
    scales: {
      x: { scale: scaleTime, axis: { ticks: { format: formatMonth } } },
      y: { scale: scaleLinear, axis: false },
    },
    controls: [
      brushX({
        // The brush snaps to the days in `values`, which also gives its handles keyboard steps
        range: controlledSignal(range, next => setRange(next)),
        values: data.map(d => d.date),
        format: formatDate,
        // The handles are centered on the range's ends, 24px wide by default
        ...(preset === 'handles' && { handleSize: 14 }),
      }),
    ],
  }), [data, range, preset])

  return (
    <>
      <div style={READOUT_STYLE}>{formatSelection(data, [range.start, range.end])}</div>
      <Chart definition={main} height={COMPARISON_TALL_CHART_HEIGHT - 24 - BRUSH_HEIGHT} ariaLabel="API requests per day in the selected range"/>
      <Chart definition={overview} height={BRUSH_HEIGHT} ariaLabel="API requests per day in 2025, with a brush that selects the range"/>
    </>
  )
}
