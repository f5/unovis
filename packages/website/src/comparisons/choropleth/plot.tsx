import React, { useEffect, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'

import { ChoroplethData, countries, usersDomain, formatUsers, formatTraffic } from './data'
import { BLUES } from './constants'

// Plot returns a figure with the color legend above the map, so the map gets the rest of the card's height
const legendHeight = 50

export default function PlotChoroplethMap ({ data, isDark }: { data: ChoroplethData; isDark: boolean }): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // Plot draws at a fixed size, so the container has to be measured to make it responsive
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!size.width) return
    const users = new Map(data.areas.map(a => [a.id, a.users]))
    const point = new Map(data.points.map(p => [p.id, p]))
    const links = data.links.map(l => ({ ...l, source: point.get(l.source), target: point.get(l.target) }))
    // Every mark with a tip follows the pointer on its own, so two tips would show at once near a data center. One tip
    // mark over all three takes the closest centroid instead: a country's, a data center's or the middle of a link's arc
    const tips = [
      ...countries.map(f => ({ geometry: f, title: `${f.properties.name}\n${users.has(`${f.id}`) ? formatUsers(users.get(`${f.id}`)) : 'No data'}` })),
      ...data.points.map(p => ({ geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] }, title: `${p.name} data center` })),
      ...links.map(l => ({
        geometry: { type: 'LineString', coordinates: [[l.source.longitude, l.source.latitude], [l.target.longitude, l.target.latitude]] },
        title: `${l.source.name} → ${l.target.name}\n${formatTraffic(l.traffic)}`,
      })),
    ]

    const plot = Plot.plot({
      width: size.width,
      height: size.height - legendHeight,
      // Text uses `currentColor`, while the tip's box and the labels' halo are painted with this variable, white by default
      style: isDark ? '--plot-background: #222' : undefined,
      projection: 'equal-earth',
      // Plot leaves out the features the color scale has no output for, such as the four shapes without a country code,
      // unless `unknown` gives them one
      color: { type: 'quantize', domain: usersDomain, range: BLUES, unknown: 'lightgray', label: 'Monthly active users (M)', tickFormat: 'd', legend: true },
      marks: [
        Plot.sphere(),
        // Plot drops the default outline once a fill is set, and the lightest countries would vanish on a white page
        Plot.geo(countries, { fill: f => users.get(`${f.id}`), stroke: 'currentColor', strokeOpacity: 0.2, strokeWidth: 0.5 }),
        // With a spherical projection links are geodesics, so the ones across the Pacific wrap around the globe's edge.
        // In the default `currentColor` they would vanish over the darkest countries, or the lightest ones in dark mode
        Plot.link(links, {
          x1: l => l.source.longitude,
          y1: l => l.source.latitude,
          x2: l => l.target.longitude,
          y2: l => l.target.latitude,
          stroke: 'gray',
          strokeWidth: l => 1 + l.traffic / 100,
        }),
        Plot.dot(data.points, { x: 'longitude', y: 'latitude' }),
        // A stroke in the background color is a halo around the labels; with a stroke, the fill defaults to none
        Plot.text(data.points, { x: 'longitude', y: 'latitude', text: 'name', dy: 6, lineAnchor: 'top', fill: 'currentColor', stroke: 'var(--plot-background)' }),
        Plot.tip(tips, Plot.pointer(Plot.geoCentroid({ geometry: 'geometry', title: 'title' }))),
      ],
    })
    // The figure keeps the browser's default margin, which would scale the SVG down
    plot.style.margin = '0'
    container.current.append(plot)
    return () => plot.remove()
  }, [data, isDark, size])

  return <div ref={container} style={{ height: '100%' }}/>
}
