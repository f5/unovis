import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import type { ChartProps } from '../types'
import { DataRecord, getBoxStats, formatMs } from './data'

type Row = { endpoint: string; value: number }

// The tip lists the statistics of the box under the pointer, from the samples grouped into it
const tipText = (rows: Row[]): string => {
  const b = getBoxStats({ endpoint: rows[0].endpoint, samples: rows.map(r => r.value) })
  return [b.endpoint, `Upper whisker: ${formatMs(b.high)}`, `Q3: ${formatMs(b.q3)}`, `Median: ${formatMs(b.median)}`, `Q1: ${formatMs(b.q1)}`, `Lower whisker: ${formatMs(b.low)}`].join('\n')
}

export default function PlotBoxPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Plot has no React component and isn't responsive: the container is measured and the chart re-rendered on resize
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!size.width) return
    // Plot computes the statistics from one row per sample
    const rows: Row[] = data.flatMap(d => d.samples.map(value => ({ endpoint: d.endpoint, value })))
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      // The tip's box is filled with this variable, white by default
      style: isDark ? '--plot-background: #222' : undefined,
      marginLeft: 55,
      // Plot sorts ordinal domains, this keeps the data's order
      x: { domain: data.map(d => d.endpoint), label: null },
      y: { grid: true, label: null, tickFormat: formatMs },
      marks: [
        // `boxY` is a composite of a rule (the whiskers), a bar (the box), a tick (the median) and dots (the outliers).
        // Its whiskers always reach the last samples within 1.5 × IQR. The options go to every part, so `fill` and `rx`
        // change the bar, and `tip: true` would open one tip per part, each with one value
        Plot.boxY(rows, {
          x: 'endpoint',
          y: 'value',
          fill: preset === 'colors' ? 'endpoint' : undefined,
          rx: preset === 'rounded' ? 8 : undefined,
        }),
        // One tip per box instead, at the median of the endpoint closest to the pointer
        Plot.tip(rows, Plot.pointerX(Plot.groupX({ y: 'median', title: tipText }, { x: 'endpoint', y: 'value', title: (d: Row) => d }))),
      ],
    })
    chartRef.current.append(chart)
    return () => chart.remove()
  }, [data, isDark, preset, size])

  return <div ref={chartRef} style={{ height: '100%' }}/>
}
