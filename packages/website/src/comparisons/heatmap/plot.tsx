import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import type { ChartProps } from '../types'
import { DataRecord, days, hours, rateDomain, formatRate, formatHour, formatCell } from './data'
import { GREENS, GREENS_DARK, ORANGES } from './constants'

export default function PlotHeatmap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Plot has no React component and isn't responsive: it draws an svg of a given size, so the container is measured
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!size.width) return
    const isTransposed = preset === 'transposed'
    const isRounded = preset === 'rounded'
    // Plot sorts ordinal domains alphabetically, these keep the days and hours in order
    const hourScale = { domain: hours, tickFormat: formatHour, label: null }
    const dayScale = { domain: days, label: null }
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      marginLeft: 40,
      x: isTransposed ? dayScale : hourScale,
      y: isTransposed ? hourScale : dayScale,
      // Plot's quantize scale splits the domain into as many buckets as there are colors
      color: { type: 'quantize', domain: rateDomain, range: preset === 'buckets' ? ORANGES : isDark ? GREENS_DARK : GREENS, tickFormat: formatRate, label: null },
      marks: [
        Plot.cell(data, {
          x: isTransposed ? 'day' : 'hour',
          y: isTransposed ? 'hour' : 'day',
          fill: 'errorRate',
          inset: isRounded ? 2.5 : undefined,
          rx: isRounded ? 6 : undefined,
          title: formatCell,
          // The tip box is white by default, which would hide its text in dark mode
          tip: { fill: isDark ? '#222' : undefined },
        }),
      ],
    })
    const legend = chart.legend('color')
    legendRef.current.append(legend)
    chartRef.current.append(chart)
    return () => {
      legend.remove()
      chart.remove()
    }
  }, [data, isDark, preset, size])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={legendRef}/>
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }}/>
    </div>
  )
}
