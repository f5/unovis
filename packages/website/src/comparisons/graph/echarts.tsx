import React from 'react'
import ReactECharts from 'echarts-for-react'

import { GraphData, NodeDatum, groups, formatRequests, formatLatency, formatAlerts } from './data'

type ItemParams = { dataType: string; data: { name: string; category: number; node: NodeDatum; source: string; target: string; value: number } }

export default function EChartsGraph ({ data, isDark }: { data: GraphData; isDark: boolean }): JSX.Element {
  const label = new Map(data.nodes.map(n => [n.id, n.label]))
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: {
          formatter: ({ dataType, data: item }: ItemParams) => dataType === 'edge'
            ? `${label.get(item.source)} → ${label.get(item.target)}<br/>${formatRequests(item.value)}`
            : `<b>${item.name}</b><br/>${groups[item.category].label}<br/>${formatLatency(item.node.latency)}${item.node.alerts ? `<br/>${formatAlerts(item.node.alerts)}` : ''}`,
        },
        legend: { data: groups.map(g => g.label) },
        series: [{
          type: 'graph',
          layout: 'force',
          force: { repulsion: 150, edgeLength: 50 },
          roam: false,
          draggable: true,
          label: { show: true, position: 'right', formatter: ({ data: item }: ItemParams) => `${item.name}\n${formatLatency(item.node.latency)}` },
          edgeSymbol: ['none', 'arrow'],
          emphasis: { focus: 'adjacency' },
          categories: groups.map(g => ({ name: g.label })),
          data: data.nodes.map(n => ({ id: n.id, name: n.label, category: groups.findIndex(g => g.key === n.group), symbolSize: 16, node: n })),
          links: data.links.map(l => ({ source: l.source, target: l.target, value: l.requests, lineStyle: { width: 1 + l.requests / 250 } })),
        }],
      }}
    />
  )
}
