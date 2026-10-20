import React from 'react'
import ReactECharts from 'echarts-for-react'
import { registerMap } from 'echarts'
import { geoMercator } from 'd3-geo'

import type { ChartProps } from '../types'
import { ChoroplethData, countries, usersDomain, formatUsers, formatTraffic, getTraffic, trafficRadius } from './data'
import { BLUES } from './constants'

// ECharts draws maps from GeoJSON registered under a name
registerMap('world', { type: 'FeatureCollection', features: countries })
// Without a projection the map is plain longitude and latitude; `projection` takes a pair of functions, here from d3-geo
const mercator = geoMercator()

export default function EChartsChoroplethMap ({ data, isDark, preset }: ChartProps<ChoroplethData>): JSX.Element {
  const point = new Map(data.points.map(p => [p.id, p]))
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        visualMap: { min: usersDomain[0], max: usersDomain[1], seriesIndex: 0, inRange: { color: BLUES } },
        geo: {
          map: 'world',
          roam: true,
          projection: preset === 'mercator' ? { project: ([lon, lat]) => mercator([lon, lat]), unproject: ([x, y]) => mercator.invert([x, y]) } : undefined,
          // The map series draws its countries on this component, so the labels are set here. `labelLayout: { hideOverlap }`
          // is a series option and doesn't reach them: every country gets its name, overlapping or not
          label: { show: preset === 'labels' },
        },
        series: [
          {
            type: 'map',
            name: 'Monthly active users',
            geoIndex: 0,
            data: data.areas.map(a => ({ name: a.name, value: a.users })),
            tooltip: { valueFormatter: formatUsers },
          },
          {
            type: 'scatter',
            name: 'Data centers',
            coordinateSystem: 'geo',
            data: data.points.map(p => ({
              name: p.name,
              value: [p.longitude, p.latitude],
              // A diameter: without one, an item takes the series' default size
              symbolSize: preset === 'traffic' ? 2 * trafficRadius(getTraffic(data.links, p.id)) : undefined,
            })),
            label: { show: true, position: 'bottom', formatter: '{b}' },
            tooltip: { formatter: '<b>{b}</b> data center' },
          },
          {
            type: 'lines',
            name: 'Traffic',
            coordinateSystem: 'geo',
            effect: { show: true },
            data: data.links.map(l => ({
              name: `${point.get(l.source).name} → ${point.get(l.target).name}`,
              value: l.traffic,
              coords: [[point.get(l.source).longitude, point.get(l.source).latitude], [point.get(l.target).longitude, point.get(l.target).latitude]],
              lineStyle: { width: 1 + l.traffic / 100 },
            })),
            tooltip: { valueFormatter: formatTraffic },
          },
        ],
      }}
    />
  )
}
