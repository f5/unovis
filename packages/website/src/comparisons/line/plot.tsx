import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import { DataRecord, SeriesKey, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)
const formatTooltipValue = (value: number | undefined): string => value === undefined ? 'No data' : formatValue(value)

export default function PlotLineChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})

  useEffect(() => {
    const visible = series.filter(s => !hidden[s.key])
    // Plot draws one line per stroke color from tidy (long) data, so the wide records are unpivoted
    const rows = data.flatMap(d => visible.map(s => ({ date: d.date, platform: s.label, users: d[s.key] })))
    const tipTitle = (d: DataRecord): string => [formatMonth(d.date), ...visible.map(s => `${s.label}: ${formatTooltipValue(d[s.key])}`)].join('\n')

    // Plot's legend is static HTML, so the clicks that toggle a series are wired by hand
    const legend = Plot.legend({ color: { domain: labels } })
    legend.querySelectorAll<HTMLElement>('[class$="-swatch"]').forEach((item, i) => {
      Object.assign(item.style, { cursor: 'pointer', opacity: hidden[series[i].key] ? 0.4 : 1 })
      item.onclick = () => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })
    })
    legendRef.current.replaceChildren(legend)

    // Plot isn't responsive: the chart is redrawn at the container's size
    const observer = new ResizeObserver(() => {
      const el = chartRef.current
      el.replaceChildren(Plot.plot({
        width: el.clientWidth,
        height: el.clientHeight,
        // Text and axes use `currentColor`; the tip's box is filled with `--plot-background`, white by default
        style: isDark ? '--plot-background: #222' : undefined,
        // Time scales are in UTC by default, and the data's months start at local midnight. Ticks are spaced for Plot's
        // short default labels (80 px apart), so the longer month labels get more room
        x: { type: 'time', label: null, tickFormat: formatMonth, tickSpacing: 120 },
        y: { label: null, grid: true, tickFormat: formatValue },
        color: { domain: labels },
        marks: [
          // Missing months leave gaps: the line breaks at undefined values
          Plot.lineY(rows, { x: 'date', y: 'users', stroke: 'platform' }),
          Plot.ruleX(data, Plot.pointerX({ x: 'date' })),
          Plot.tip(data, Plot.pointerX({ x: 'date', frameAnchor: 'top', title: tipTitle })),
        ],
      }))
    })
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [data, hidden, isDark])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={legendRef}/>
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }}/>
    </div>
  )
}
