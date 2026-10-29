import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import type { ChartProps } from '../types'
import { DEPLOYMENT_ICON_PATH, ICON_SIZE, ICON_VIEW_BOX, INCIDENT_ICON_PATH, WEEK_END, WEEK_START } from './constants'
import { EventKind, TimelineEvent, kinds, services, formatDay, formatRange, getKindLabel } from './data'

// Plot's default categorical palette is Observable10: the colors of Deployment and Incident, for the icons
const iconColors = { deployment: '#4269d0', incident: '#efb118' }
const iconSrc = (path: string, color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEW_BOX}"><path d="${path}" fill="${color}"/></svg>`)}`

export default function PlotTimeline ({ data, isDark, preset }: ChartProps<TimelineEvent[]>): JSX.Element {
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hidden, setHidden] = useState<Partial<Record<EventKind, boolean>>>({})

  // Plot has no React component and isn't responsive: it draws an svg of a given size, so the container is measured
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!size.width) return
    const visible = data.filter(d => !hidden[d.kind])
    const links = visible.flatMap(d => {
      const cause = visible.find(c => c.id === d.causeId)
      return cause ? [{ x1: cause.end, y1: cause.service, x2: d.start, y2: d.service }] : []
    })
    const chart = Plot.plot({
      width: size.width,
      height: size.height,
      // Plot's margins don't grow with the tick labels, the service names need more room
      marginLeft: 90,
      x: { type: 'time', domain: [WEEK_START, WEEK_END], ticks: 'day', tickFormat: formatDay, grid: true, label: null },
      // Plot sorts ordinal domains alphabetically, this keeps the services in order
      y: { domain: services, label: null },
      color: { domain: kinds.map(k => k.label) },
      marks: [
        Plot.barX(visible, {
          x1: 'start',
          x2: 'end',
          y: 'service',
          fill: d => getKindLabel(d.kind),
          // Corner radii are scaled down to fit the bar, so a large one rounds the ends fully
          r: preset === 'rounded' ? 999 : undefined,
          // The tip box is white by default, which would hide its text in dark mode
          tip: { fill: isDark ? '#222' : undefined },
          title: d => `${d.title}\n${d.service} · ${getKindLabel(d.kind)}\n${formatRange(d)}`,
        }),
        preset === 'arrows' ? Plot.arrow(links, { x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2', stroke: 'currentColor', headLength: 8 }) : null,
        preset === 'icons'
          ? [
            Plot.image(visible.filter(d => d.kind === 'deployment'), { x: 'end', y: 'service', src: iconSrc(DEPLOYMENT_ICON_PATH, iconColors.deployment), width: ICON_SIZE, dx: ICON_SIZE / 2 }),
            Plot.image(visible.filter(d => d.kind === 'incident'), { x: 'start', y: 'service', src: iconSrc(INCIDENT_ICON_PATH, iconColors.incident), width: ICON_SIZE, dx: -ICON_SIZE / 2 }),
          ]
          : null,
      ],
    })
    // Plot's legend is static: toggling a kind takes a click handler on each swatch
    const legend = chart.legend('color')
    legend.querySelectorAll<HTMLElement>('[class$="-swatch"]').forEach((swatch, i) => {
      swatch.style.cursor = 'pointer'
      swatch.style.opacity = hidden[kinds[i].key] ? '0.4' : '1'
      swatch.onclick = () => setHidden({ ...hidden, [kinds[i].key]: !hidden[kinds[i].key] })
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
