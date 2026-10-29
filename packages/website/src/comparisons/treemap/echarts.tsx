import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, teams, formatCost } from './data'

export default function EChartsTreemap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // echarts-for-react merges each option into the previous one, so the preset options are set in every state
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { valueFormatter: formatCost },
        series: [{
          type: 'treemap',
          // Zooming and panning are on by default; they're off here so the page keeps scrolling
          roam: false,
          label: { formatter: ({ name, value }: { name: string; value: number }) => `${name}: ${formatCost(value)}` },
          itemStyle: { gapWidth: preset === 'rounded' ? 6 : 0, borderRadius: preset === 'rounded' ? 8 : 0 },
          // Levels start at the root: 0 is the whole chart, 1 the teams, 2 the services
          levels: [{}, {
            upperLabel: { show: preset === 'groups', height: 20 },
            // A team's `colorSaturation` range spreads over its services by value
            colorSaturation: preset === 'shades' ? [0.75, 0.35] : 'none',
          }],
          data: teams.map(team => ({
            name: team,
            children: data.filter(d => d.team === team).map(d => ({ name: d.service, value: d.cost })),
          })),
        }],
      }}
    />
  )
}
