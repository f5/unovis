import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatValue } from './data'

export default function PlotGroupedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
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
    // Plot sorts ordinal domains, this keeps the data's order
    const regions = { domain: data.map(d => d.region), label: null }
    // Plot warns that the years look like numbers unless the scale type is explicit
    const years = { type: 'band' as const, axis: null }
    const values = { label: null, grid: true, tickFormat: formatValue }
    // A title replaces the tip's list of channels: here, all the years of the region
    const title = (r: typeof rows[number]): string => tipTitle(r.record)
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      // The tip's box is filled with this variable, white by default
      style: isDark ? '--plot-background: #222' : undefined,
      color: { domain: series.map(s => s.label) },
      ...(preset === 'horizontal'
        ? {
          // The facet axis sits on the right by default, and Plot doesn't size the margin to the labels
          fy: { ...regions, axis: 'left' as const },
          marginLeft: 120,
          y: years,
          x: values,
          marks: [
            Plot.barX(rows, { fy: 'region', y: 'year', x: 'value', fill: 'year', tip: 'y', title }),
            Plot.ruleX([0]),
          ],
        }
        : {
          fx: regions,
          x: years,
          y: values,
          marks: [
            // Plot has no grouped bar mode: grouping is faceting, one facet per region along `fx`, one bar per year in each
            // `tip: 'x'` picks the bar closest to the pointer along x, so the tip shows anywhere in a bar's column, not only near its middle
            Plot.barY(rows, { fx: 'region', x: 'year', y: 'value', fill: 'year', tip: 'x', title }),
            Plot.ruleY([0]),
            // An explicit axis mark replaces the implicit one (at the top unless anchored); `lineWidth` (in ems) and `textOverflow` trim the labels
            preset === 'trim-labels' ? Plot.axisFx({ anchor: 'bottom', label: null, lineWidth: 8, textOverflow: 'ellipsis-middle' }) : null,
          ],
        }),
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
  }, [data, isDark, preset, size, hidden])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div ref={legendRef}/>
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }}/>
    </div>
  )
}
