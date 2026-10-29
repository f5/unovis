import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)
const MIGRATION = { from: new Date(2024, 6, 1), to: new Date(2024, 8, 1) }
const BUDGET = 100

export default function PlotAreaChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})

  useEffect(() => {
    const visible = series.filter(s => !hidden[s.key])
    // Plot stacks tidy data by the fill channel, so the records are unpivoted into one row per month and service
    const rows = data.flatMap(d => visible.map(s => ({ date: d.date, series: s.label, value: d[s.key] })))
    const tipTitle = (d: DataRecord): string => [formatMonth(d.date), ...visible.map(s => `${s.label}: ${formatValue(d[s.key])}`)].join('\n')
    const annotated = preset === 'annotations'

    // Plot's legend is static HTML, so the clicks that toggle a series are wired by hand
    const legend = Plot.legend({ color: { domain: labels } })
    legend.querySelectorAll('span').forEach((swatch, i) => {
      swatch.style.cursor = 'pointer'
      swatch.style.opacity = hidden[series[i].key] ? '0.4' : '1'
      swatch.onclick = () => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })
    })
    legendRef.current.replaceChildren(legend)

    // Plot isn't responsive: the chart is rebuilt at the container's size
    const observer = new ResizeObserver(() => {
      const el = chartRef.current
      el.replaceChildren(Plot.plot({
        width: el.clientWidth,
        height: el.clientHeight,
        // The tip is filled with this variable, white by default
        style: isDark ? '--plot-background: #222' : undefined,
        // Plot puts dates on a UTC scale by default; these are local dates, as the formatters expect
        x: { type: 'time', label: null, tickFormat: formatMonth },
        y: { label: null, grid: true, tickFormat: formatValue },
        color: { domain: labels },
        marks: [
          Plot.areaY(rows, { x: 'date', y: 'value', fill: 'series', curve: preset === 'step' ? 'step' : 'linear' }),
          // A bar with x1 and x2 but no y spans the frame's height; Plot skips null marks
          annotated
            ? [
              Plot.barX([MIGRATION], { x1: 'from', x2: 'to', fill: 'currentColor', fillOpacity: 0.15 }),
              Plot.text([MIGRATION], { x: 'from', text: () => 'Migration', frameAnchor: 'top', textAnchor: 'start', dx: 4, dy: 8 }),
              Plot.ruleY([BUDGET], { stroke: 'red', strokeDasharray: '6 4' }),
              Plot.text([BUDGET], { y: d => d, text: d => `Budget ${formatValue(d)}`, frameAnchor: 'right', dy: -8 }),
            ]
            : null,
          // A rule and a tip for the month nearest to the pointer, with the values of every visible series
          Plot.ruleX(data, Plot.pointerX({ x: 'date' })),
          Plot.tip(data, Plot.pointerX({ x: 'date', frameAnchor: 'top', title: tipTitle })),
        ],
      }))
    })
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [data, hidden, isDark, preset])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={legendRef}/>
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }}/>
    </div>
  )
}
