import React from 'react'
import ReactECharts from 'echarts-for-react'

import { SankeyData, formatVisits } from './data'

export default function EChartsSankey ({ data, isDark }: { data: SankeyData; isDark: boolean }): JSX.Element {
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
          lineStyle: { color: 'gradient', curveness: 0.5 },
          data: data.nodes.map(n => ({ name: n.label })),
          links: data.links.map(l => ({ source: name.get(l.source), target: name.get(l.target), value: l.value })),
        }],
      }}
    />
  )
}
