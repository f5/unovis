import React, { useMemo } from 'react'
import { scaleTime } from 'd3-scale'
import { crosshair, defineChart, dot, lineY, link, rect, ruleY, text } from '@tanstack/charts'
import { decorative } from '@tanstack/charts/mark/decorative'
import { Chart } from '@tanstack/charts/react'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { Data, formatDay, formatValue } from './data'

export default function TanStackAnnotationsChart ({ data, preset }: ChartProps<Data>): JSX.Element {
  const definition = useMemo(() => {
    const { days, events, incident } = data
    const calloutValue = (): number => CALLOUT_VALUE
    // A `rect` takes both y endpoints in data units, so the band is bound to a hidden `frame` scale fixed to [0, 1] to
    // span the plot's height
    const band = [{ ...incident, bottom: 0, top: 1 }]
    const goal = [{ date: days[0].date, users: GOAL }]

    return defineChart({
      marks: [
        // `decorative()` keeps the annotations out of the tooltip
        ...(preset === 'window' ? [
          decorative(rect(band, { x1: 'start', x2: 'end', y1: 'bottom', y2: 'top', yScale: 'frame', fill: 'currentColor', fillOpacity: 0.1, inset: 0 })),
          ruleY(goal, { y: 'users', strokeDasharray: '6 4' }),
          decorative(text(goal, { x: 'date', y: 'users', text: d => `Goal ${formatValue(d.users)}`, fontSize: 12, anchor: 'start', dx: 4, dy: 10 })),
        ] : []),
        lineY(days, { x: 'date', y: 'users' }),
        // Every callout is a link from the day's value up to the callout row. Text marks draw one line each and don't
        // wrap, so the headline and the detail are two marks
        decorative(link(events, { x1: 'date', y1: 'users', x2: 'date', y2: calloutValue, stroke: 'currentColor', strokeDasharray: preset === 'rings' ? '2 2' : undefined })),
        ...(preset === 'rings' ? [decorative(dot(events, { x: 'date', y: 'users', r: 6, fill: 'none', stroke: 'currentColor' }))] : []),
        decorative(text(events, { x: 'date', y: calloutValue, text: e => e.title, fontSize: 12, fontWeight: preset === 'rich' ? 700 : undefined, dy: -22 })),
        decorative(text(events, { x: 'date', y: calloutValue, text: e => e.detail, fontSize: 12, dy: -8 })),
        crosshair({ y: false }),
      ],
      scales: {
        // The compact scales cover numbers and categories; dates take D3's time scale
        x: { scale: scaleTime, axis: { ticks: { format: formatDay } } },
        y: { scale: scaleLinear().domain([0, VALUE_MAX]), grid: true, axis: { ticks: { format: formatValue } } },
        frame: { channel: 'y', scale: scaleLinear().domain([0, 1]), axis: false },
      },
      focus: 'group-x',
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        items: [
          { channel: 'x', label: 'Day', text: p => formatDay(p.xValue) },
          { channel: 'y', label: 'Active users', text: p => formatValue(p.yValue) },
        ],
      },
      svgAnimation: true,
    })
  }, [data, preset])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Daily active users with release and incident callouts"/>
}
