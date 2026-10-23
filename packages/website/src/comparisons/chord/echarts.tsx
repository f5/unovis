import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { ChordData, formatTraffic } from './data'

export default function EChartsChordDiagram ({ data, isDark, preset }: ChartProps<ChordData>): JSX.Element {
  // ECharts links chord nodes by name
  const name = new Map(data.nodes.map(n => [n.id, n.label]))
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', valueFormatter: formatTraffic },
        series: [{
          type: 'chord',
          // Options are merged into the previous ones on update, so every preset value is set in both states
          radius: preset === 'gaps' ? ['60%', '80%'] : ['70%', '80%'],
          padAngle: preset === 'gaps' ? 6 : 3,
          data: data.nodes.map(n => ({ name: n.label })),
          links: data.links.map(l => ({ source: name.get(l.source), target: name.get(l.target), value: l.value })),
        }],
      }}
    />
  )
}
