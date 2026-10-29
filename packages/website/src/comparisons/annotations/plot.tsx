import React, { useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'

import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { Data, DataRecord, ChartEvent, formatDay, formatEvent, formatValue } from './data'

const calloutValue = (): number => CALLOUT_VALUE

export default function PlotAnnotationsChart ({ data, isDark, preset }: ChartProps<Data>): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { days, events, incident } = data
    // Text marks wrap at `lineWidth`, in ems. A mark has one font weight, so the rich callouts are two text marks: the
    // headline on its own line above the detail
    const calloutText = preset === 'rich'
      ? [
        Plot.text(events, { x: 'date', y: calloutValue, text: (e: ChartEvent) => e.title, fontWeight: 'bold', lineAnchor: 'bottom', dy: -28 }),
        Plot.text(events, { x: 'date', y: calloutValue, text: (e: ChartEvent) => e.detail, lineWidth: 10, lineAnchor: 'bottom', dy: -4 }),
      ]
      : Plot.text(events, { x: 'date', y: calloutValue, text: formatEvent, lineWidth: 10, lineAnchor: 'bottom', dy: -4 })

    // Plot isn't responsive: the chart is redrawn at the container's size
    const observer = new ResizeObserver(() => {
      const el = chartRef.current
      el.replaceChildren(Plot.plot({
        width: el.clientWidth,
        height: el.clientHeight,
        // Text and axes use `currentColor`; the tip's box is filled with `--plot-background`, white by default
        style: isDark ? '--plot-background: #222' : undefined,
        // Time scales are in UTC by default, and the data's days start at local midnight
        x: { type: 'time', label: null, tickFormat: formatDay },
        y: { label: null, grid: true, domain: [0, VALUE_MAX], tickFormat: formatValue },
        marks: [
          // A `barX` with only `x1` and `x2` spans the frame's height
          preset === 'window' ? [
            Plot.barX([incident], { x1: 'start', x2: 'end', fill: 'currentColor', fillOpacity: 0.1 }),
            Plot.ruleY([GOAL], { strokeDasharray: '6 4' }),
            Plot.text([GOAL], { y: Plot.identity, text: d => `Goal ${formatValue(d)}`, frameAnchor: 'left', textAnchor: 'start', dx: 4, dy: 8 }),
          ] : null,
          Plot.lineY(days, { x: 'date', y: 'users' }),
          // A `ruleX` with `y1` and `y2` is a vertical segment: the connector from the day's value up to the text
          Plot.ruleX(events, { x: 'date', y1: 'users', y2: calloutValue, strokeDasharray: preset === 'rings' ? '2 2' : undefined }),
          preset === 'rings' ? Plot.dot(events, { x: 'date', y: 'users', r: 6 }) : null,
          calloutText,
          Plot.ruleX(days, Plot.pointerX({ x: 'date' })),
          Plot.tip(days, Plot.pointerX({ x: 'date', y: 'users', title: (d: DataRecord) => `${formatDay(d.date)}\nActive users: ${formatValue(d.users)}` })),
        ],
      }))
    })
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [data, isDark, preset])

  return <div ref={chartRef} style={{ height: '100%' }}/>
}
