import React, { useMemo, useState } from 'react'
import { scaleTime } from 'd3-scale'
import { curveStep } from 'd3-shape'
import { areaY, defineChart, rect, ruleY, text } from '@tanstack/charts'
import { crosshair } from '@tanstack/charts/crosshair'
import { d3Curve } from '@tanstack/charts/d3/shape'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { decorative } from '@tanstack/charts/mark/decorative'
import { Chart } from '@tanstack/charts/react'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)
const MIGRATION = { from: new Date(2024, 6, 1), to: new Date(2024, 8, 1) }
const BUDGET = 100

export default function TanStackAreaChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(labels)

  const definition = useMemo(() => {
    // Areas stack by the color channel, so the records are unpivoted into one row per month and service
    const rows = data.flatMap(d => series.map(s => ({ date: d.date, series: s.label, value: d[s.key] })))
    const annotated = preset === 'annotations'
    // `rect` has no plot-spanning mode: it needs both y ends, so the band runs from zero to the top of the inferred y domain,
    // which is the highest monthly total or the budget line
    const yMax = Math.max(BUDGET, ...data.map(d => series.reduce((total, s) => total + d[s.key], 0)))

    return defineChart({
      marks: [
        // Annotations are decorative, so they don't add points to the tooltip and the keyboard focus
        ...(annotated ? [decorative(rect([MIGRATION], { id: 'migration', x1: 'from', x2: 'to', y1: () => 0, y2: () => yMax, fill: 'gray', fillOpacity: 0.2 }))] : []),
        // Areas are straight between the points unless a d3-shape curve is passed through the adapter
        areaY(rows, { x: 'date', y: 'value', color: 'series', curve: preset === 'step' ? d3Curve(curveStep) : undefined }),
        ...(annotated
          ? [
            decorative(text([MIGRATION], { id: 'migration-label', x: 'from', y: () => yMax, text: () => 'Migration', anchor: 'start', dx: 4, dy: 10 })),
            ruleY([BUDGET], { id: 'budget', stroke: 'red', strokeDasharray: '6 4' }),
            decorative(text([BUDGET], { id: 'budget-label', x: () => data[data.length - 1].date, y: d => d, text: d => `Budget ${formatValue(d)}`, anchor: 'end', dy: -10 })),
          ]
          : []),
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
  }, [data, visible, preset])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Monthly cloud spend by service"/>
}
