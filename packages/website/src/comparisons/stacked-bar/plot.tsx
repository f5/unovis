import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import { DataRecord, SeriesKey, series, formatValue } from './data'

export default function PlotStackedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
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
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      // Plot sorts ordinal domains alphabetically, this keeps the months in order
      x: { domain: data.map(d => d.month), label: null },
      y: { grid: true, label: null, tickFormat: formatValue },
      color: { domain: series.map(s => s.label) },
      marks: [
        Plot.barY(rows, { x: 'month', y: 'tickets', fill: 'priority' }),
        Plot.ruleY([0]),
        // One tip for the whole stack: the month nearest to the pointer's x, anchored to the top of its stack
        Plot.tip(data, Plot.pointerX({
          x: 'month',
          y: (d: DataRecord) => visible.reduce((total, s) => total + d[s.key], 0),
          title: (d: DataRecord) => [d.month, ...visible.map(s => `${s.label}: ${formatValue(d[s.key])}`)].join('\n'),
          // The tip box is white by default, which would hide its text in dark mode
          fill: isDark ? '#222' : undefined,
        })),
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
  }, [data, isDark, size, hidden])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={legendRef}/>
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }}/>
    </div>
  )
}
