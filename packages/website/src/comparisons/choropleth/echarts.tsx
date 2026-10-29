import React from 'react'
import ReactECharts from 'echarts-for-react'
import { registerMap } from 'echarts'
import { geoArea, geoCentroid, geoMercator } from 'd3-geo'

import type { ChartProps } from '../types'
import { ChoroplethData, countries, usersDomain, formatUsers, formatTraffic, getTraffic, trafficRadius } from './data'
import { BLUES } from './constants'

// ECharts draws maps from GeoJSON registered under a name
registerMap('world', { type: 'FeatureCollection', features: countries })
// Without a projection the map is plain longitude and latitude; `projection` takes a pair of functions, here from d3-geo
const mercator = geoMercator()
// For the "Country labels" preset. Of two overlapping labels, `hideOverlap` keeps the one whose symbol is larger, and these
// symbols are all size 0, so it keeps the one that comes first: the countries go largest first
const countryLabels = [...countries].sort((a, b) => geoArea(b) - geoArea(a)).map(f => ({ name: f.properties.name, value: geoCentroid(f) }))

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
          {
            // The geo component draws the countries, and its labels skip `labelLayout`, so the names are a series of bare labels
            // at the country centers. It's emptied rather than left out, as the option merges into the previous one
            type: 'scatter',
            name: 'Countries',
            coordinateSystem: 'geo',
            silent: true,
            symbolSize: 0,
            data: preset === 'labels' ? countryLabels : [],
            // A label `inside` its symbol, the default, is outlined in the symbol's color in the dark theme. Given the center as a
            // position of its own, it gets the same halo as the data centers' labels
            label: { show: true, formatter: '{b}', position: ['50%', '50%'], align: 'center', verticalAlign: 'middle' },
            labelLayout: { hideOverlap: true },
          },
        ],
      }}
    />
  )
}
