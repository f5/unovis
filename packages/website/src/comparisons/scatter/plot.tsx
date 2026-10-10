import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import { DataRecord, species, formatMass } from './data'

export default function PlotScatterPlot ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hidden, setHidden] = useState<Record<string, boolean>>({})

  // Plot has no React component and isn't responsive: measure the container and re-render on resize
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!size.width || !size.height) return
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      grid: true,
      // The tip's box is filled with `--plot-background`, which is white by default
      style: isDark ? '--plot-background: #222' : undefined,
      x: { label: 'Flipper length (mm)' },
      y: { label: 'Bill length (mm)' },
      r: { label: 'Body mass' },
      color: { domain: species, label: 'Species' },
      symbol: { domain: species, range: ['circle', 'triangle', 'square'] },
      marks: [
        Plot.dot(data.filter(d => !hidden[d.species]), {
          x: 'flipperLength',
          y: 'billLength',
          r: 'bodyMass',
          fill: 'species',
          symbol: 'species',
          // The symbol channel repeats the species, so the tip leaves it out
          tip: { format: { fill: true, x: true, y: true, r: formatMass, symbol: false } },
        }),
      ],
    })
    // `fill` and `symbol` encode the same field, so the symbol legend draws colored symbols. It's static: toggling a species is our own code
    const legend = chart.legend('symbol')
    legend.querySelectorAll<HTMLElement>('[class$="-swatch"]').forEach((swatch, i) => {
      swatch.style.cursor = 'pointer'
      swatch.style.opacity = hidden[species[i]] ? '0.4' : '1'
      swatch.onclick = () => setHidden({ ...hidden, [species[i]]: !hidden[species[i]] })
    })
    legendRef.current.append(legend)
    chartRef.current.append(chart)
    return () => {
      legend.remove()
      chart.remove()
    }
  }, [data, isDark, size, hidden])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div ref={legendRef}/>
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }}/>
    </div>
  )
}
