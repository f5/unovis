import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { SankeyData, formatVisits } from './data'

export default function EChartsSankey ({ data, isDark, preset }: ChartProps<SankeyData>): JSX.Element {
  // ECharts links sankey nodes by name
  const name = new Map(data.nodes.map(n => [n.id, n.label]))
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', valueFormatter: formatVisits },
        series: [{
          type: 'sankey',
          emphasis: { focus: 'adjacency' },
          // Options are merged into the previous ones on update, so every preset value is set in both states
          nodeWidth: preset === 'thin' ? 6 : 20,
          nodeGap: preset === 'thin' ? 24 : 8,
          lineStyle: { color: preset === 'colors' ? 'source' : 'gradient', curveness: 0.5 },
          data: data.nodes.map(n => ({ name: n.label })),
          links: data.links.map(l => ({ source: name.get(l.source), target: name.get(l.target), value: l.value })),
        }],
      }}
    />
  )
}
