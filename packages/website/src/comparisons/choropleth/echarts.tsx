import React from 'react'
import ReactECharts from 'echarts-for-react'
import { registerMap } from 'echarts'

import { ChoroplethData, countries, usersDomain, formatUsers, formatTraffic } from './data'
import { BLUES } from './constants'

// ECharts draws maps from GeoJSON registered under a name
registerMap('world', { type: 'FeatureCollection', features: countries })

export default function EChartsChoroplethMap ({ data, isDark }: { data: ChoroplethData; isDark: boolean }): JSX.Element {
  const point = new Map(data.points.map(p => [p.id, p]))
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        visualMap: { min: usersDomain[0], max: usersDomain[1], seriesIndex: 0, inRange: { color: BLUES } },
        geo: { map: 'world', roam: true },
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
            data: data.points.map(p => ({ name: p.name, value: [p.longitude, p.latitude] })),
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
