import React, { useMemo, useState } from 'react'
import { scaleTime } from 'd3-scale'
import { curveStep } from 'd3-shape'
import { crosshair, d3Curve, defineChart, lineY, rect, ruleY, text } from '@tanstack/charts'
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
const TARGET = 50

export default function TanStackLineChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(labels)

  const definition = useMemo(() => {
    // TanStack Charts draws one line per color from tidy (long) data, so the wide records are unpivoted
    const rows = data.flatMap(d => series.map(s => ({ date: d.date, platform: s.label, users: d[s.key] })))
    const curve = preset === 'step' ? d3Curve(curveStep) : undefined
    const isIos = (row: typeof rows[number]): boolean => row.platform === 'iOS'

    // The months the iOS app reported no data and the target, for the "Annotations" preset. A `rect` takes both y
    // endpoints in data units, so the band is bound to a hidden `frame` scale fixed to [0, 1] to span the plot's height
    const outage = data.filter(d => d.ios === undefined)
    const band = outage.length > 0 ? [{ start: outage[0].date, end: outage[outage.length - 1].date, bottom: 0, top: 1 }] : []
    const target = [{ date: data[data.length - 1].date, users: TARGET }]

    return defineChart({
      marks: [
        // `decorative()` keeps the labels and the band out of the tooltip
        ...(preset === 'annotations' ? [
          decorative(rect(band, { x1: 'start', x2: 'end', y1: 'bottom', y2: 'top', yScale: 'frame', fill: 'currentColor', fillOpacity: 0.1, inset: 0 })),
          decorative(text(band, { x: 'start', y: 'top', yScale: 'frame', text: () => 'iOS outage', fontSize: 12, anchor: 'start', dx: 4, dy: 10 })),
          ruleY(target, { y: 'users', strokeDasharray: '6 4' }),
          decorative(text(target, { x: 'date', y: 'users', text: d => `Target ${formatValue(d.users)}`, fontSize: 12, anchor: 'end', dy: -8 })),
        ] : []),
        // Missing months leave gaps: undefined values break the line
        lineY(preset === 'dashed' ? rows.filter(r => !isIos(r)) : rows, { x: 'date', y: 'users', color: 'platform', curve }),
        // `strokeDasharray` is one value for the whole mark, so the dashed iOS line is a mark of its own
        ...(preset === 'dashed' ? [lineY(rows.filter(isIos), { x: 'date', y: 'users', color: 'platform', curve, strokeDasharray: '6 4' })] : []),
        crosshair({ y: false }),
      ],
      scales: {
        // The compact scales cover numbers and categories; dates take D3's time scale
        x: { scale: scaleTime, axis: { ticks: { format: formatMonth } } },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { ticks: { format: formatValue } } },
        frame: { channel: 'y', scale: scaleLinear().domain([0, 1]), axis: false },
      },
      color: {
        // Fixes the colors' order, which would otherwise follow the order the marks list the series in
        domain: labels,
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
  }, [data, visible, preset])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Monthly active users by platform"/>
}
