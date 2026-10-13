import React, { useMemo } from 'react'
import { geoEqualEarth } from 'd3-geo'
import { scaleQuantize } from 'd3-scale'
import { colorLegend, defineChart } from '@tanstack/charts'
import { geoShape } from '@tanstack/charts/geo'
import { Chart } from '@tanstack/charts/react'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { ChoroplethData, countries, usersDomain, formatUsers, formatTraffic } from './data'
import { BLUES } from './constants'

// Every layer fits its own projection to the whole globe, so that the layers line up
const projection = { type: geoEqualEarth, fit: 'sphere' as const }
// Shapes have no outline by default, and the lightest countries would vanish on a white page
const outline = { stroke: 'currentColor', strokeOpacity: 0.2, strokeWidth: 0.5 }

export default function TanStackChoroplethMap ({ data }: { data: ChoroplethData }): JSX.Element {
  const definition = useMemo(() => {
    const users = new Map(data.areas.map(a => [a.id, a.users]))
    const point = new Map(data.points.map(p => [p.id, p]))
    // The geo mark draws GeoJSON only, so the data centers become Point features and the links LineString features,
    // projected as great-circle arcs. The chart has one tooltip for all the layers, so every feature carries its text
    const areas = countries.map(f => {
      const value = users.get(`${f.id}`)
      return { ...f, properties: { users: value, title: `${f.properties.name}\n${value === undefined ? 'No data' : formatUsers(value)}` } }
    })
    const dataCenters = data.points.map(p => ({
      type: 'Feature' as const,
      id: p.id,
      properties: { title: `${p.name} data center` },
      geometry: { type: 'Point' as const, coordinates: [p.longitude, p.latitude] },
    }))
    const links = data.links.map(({ source, target, traffic }) => ({
      type: 'Feature' as const,
      id: `${source}-${target}`,
      properties: { width: 1 + traffic / 100, title: `${point.get(source).name} → ${point.get(target).name}\n${formatTraffic(traffic)}` },
      geometry: {
        type: 'LineString' as const,
        coordinates: [[point.get(source).longitude, point.get(source).latitude], [point.get(target).longitude, point.get(target).latitude]],
      },
    }))

    return defineChart({
      marks: [
        // The color scale paints a country without a value in its first color, the same as the fewest users
        geoShape(areas.filter(f => f.properties.users === undefined), { projection, fill: 'lightgray', ...outline }),
        geoShape(areas.filter(f => f.properties.users !== undefined), { projection, color: f => f.properties.users, ...outline }),
        // `strokeWidth` is one number per mark rather than a channel, so every link is a mark of its own. Without a color
        // value, lines and points also take the color scale's first, almost white, color
        ...links.map(l => geoShape([l], { projection, stroke: 'gray', strokeWidth: l.properties.width })),
        // There are no data center labels: `text` places labels with x and y scales, and the geo mark has no text.
        // The outline keeps the points visible over the lightest countries in dark mode, where `currentColor` is white
        geoShape(dataCenters, { projection, fill: 'currentColor', stroke: 'gray' }),
      ],
      scales: { x: null, y: null },
      color: {
        scale: scaleQuantize<string>,
        domain: usersDomain,
        range: BLUES,
        legend: colorLegend({ label: 'Monthly active users (M)', format: v => `${Math.round(v)}` }),
      },
      // The pointer focuses the nearest feature centroid, not the shape under it. A link the map's edge splits in two,
      // such as San Francisco → Tokyo, has its centroid between the pieces, in the middle of the map
      tooltip: { use: tooltip, format: ({ datum }) => datum.properties.title },
      // Tweens numeric attributes only: the link widths animate, the country colors switch at once
      svgAnimation: true,
    })
  }, [data])

  return <Chart definition={definition} height={COMPARISON_TALL_CHART_HEIGHT} ariaLabel="Monthly active users by country, with data centers and the traffic between them"/>
}
