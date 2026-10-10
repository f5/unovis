import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import { DataRecord, SeriesKey, series, formatValue } from './data'

export default function PlotGroupedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})

  // Plot has no React component and isn't responsive: the container is measured and the chart re-rendered on resize
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!size.width) return
    const visible = series.filter(s => !hidden[s.key])
    const tipTitle = (d: DataRecord): string => [d.region, ...visible.map(s => `${s.label}: ${formatValue(d[s.key])}`)].join('\n')
    // Plot draws one bar per row, so the records are unpivoted into one row per region and year
    const rows = data.flatMap(d => visible.map(s => ({ region: d.region, year: s.label, value: d[s.key], record: d })))
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      // The tip's box is filled with this variable, white by default
      style: isDark ? '--plot-background: #222' : undefined,
      // Plot sorts ordinal domains, this keeps the data's order
      fx: { domain: data.map(d => d.region), label: null },
      // Plot warns that the years look like numbers unless the scale type is explicit
      x: { type: 'band', axis: null },
      y: { label: null, grid: true, tickFormat: formatValue },
      color: { domain: series.map(s => s.label) },
      marks: [
        // Plot has no grouped bar mode: grouping is faceting, one facet per region along `fx`, one bar per year in each
        Plot.barY(rows, {
          fx: 'region',
          x: 'year',
          y: 'value',
          fill: 'year',
          // `tip: 'x'` picks the bar closest to the pointer along x, so the tip shows anywhere in a bar's column, not only near its middle
          tip: 'x',
          // A title replaces the tip's list of channels: here, all the years of the region
          title: r => tipTitle(r.record),
        }),
        Plot.ruleY([0]),
      ],
    })

    // Plot's legend is static HTML, so the clicks that toggle a series are wired by hand
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
