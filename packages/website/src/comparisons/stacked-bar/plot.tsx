import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatValue } from './data'

const CAPACITY = 400

export default function PlotStackedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})

  // Plot has no React component and isn't responsive: it draws an svg of a given size, so the container is measured
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!size.width) return
    const visible = series.filter(s => !hidden[s.key])
    // Plot stacks tidy data, one row per bar segment, in the order of the rows
    const rows = data.flatMap(d => visible.map(s => ({ month: d.month, priority: s.label, tickets: d[s.key] })))
    const total = (d: DataRecord): number => visible.reduce((sum, s) => sum + d[s.key], 0)
    const tip = {
      title: (d: DataRecord) => [d.month, ...visible.map(s => `${s.label}: ${formatValue(d[s.key])}`)].join('\n'),
      // The tip box is white by default, which would hide its text in dark mode
      fill: isDark ? '#222' : undefined,
    }
    // Plot sorts ordinal domains alphabetically, this keeps the months in order
    const monthScale = { domain: data.map(d => d.month), label: null }
    const valueScale = { grid: true, label: null, tickFormat: formatValue }
    const isHorizontal = preset === 'horizontal'
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      x: isHorizontal ? valueScale : monthScale,
      y: isHorizontal ? monthScale : valueScale,
      color: { domain: series.map(s => s.label) },
      marks: isHorizontal
        ? [
          Plot.barX(rows, { y: 'month', x: 'tickets', fill: 'priority' }),
          Plot.ruleX([0]),
          Plot.tip(data, Plot.pointerY({ y: 'month', x: total, ...tip })),
        ]
        : [
          Plot.barY(rows, { x: 'month', y: 'tickets', fill: 'priority' }),
          Plot.ruleY([0]),
          // One tip for the whole stack: the month nearest to the pointer's x, anchored to the top of its stack
          Plot.tip(data, Plot.pointerX({ x: 'month', y: total, ...tip })),
          // A reference line is a rule mark, and its label a text mark pinned to the frame's right edge
          preset === 'capacity'
            ? [
              Plot.ruleY([CAPACITY], { strokeDasharray: '6,4' }),
              Plot.textY([CAPACITY], { frameAnchor: 'right', textAnchor: 'end', dy: -6, text: () => `Capacity ${formatValue(CAPACITY)}` }),
            ]
            : null,
        ],
    })
    // Plot's legend is static: toggling a series takes a click handler on each swatch
    const legend = chart.legend('color')
    legend.querySelectorAll<HTMLElement>('[class$="-swatch"]').forEach((swatch, i) => {
      swatch.style.cursor = 'pointer'
      swatch.style.opacity = hidden[series[i].key] ? '0.4' : '1'
      swatch.onclick = () => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })
    })
    legendRef.current.append(legend)
    chartRef.current.append(chart)
    return () => {
      legend.remove()
      chart.remove()
    }
  }, [data, isDark, preset, size, hidden])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={legendRef}/>
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }}/>
    </div>
  )
}
