import React from 'react'
import { Chart, LinearScale, PointElement, Tooltip } from 'chart.js'
import { ForceDirectedGraphController, EdgeLine } from 'chartjs-chart-graph'
import { Chart as ReactChart } from 'react-chartjs-2'

import { GraphData, groups, formatLatency, formatAlerts } from './data'

Chart.register(ForceDirectedGraphController, EdgeLine, LinearScale, PointElement, Tooltip)

// The Colors plugin colors whole datasets, so we color the nodes with the Chart.js default palette ourselves
const colors = ['#36a2eb', '#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0']

export default function ChartJsGraph ({ data, isDark }: { data: GraphData; isDark: boolean }): JSX.Element {
  const nodeIndex = new Map(data.nodes.map((n, i) => [n.id, i]))
  return (
    <ReactChart
      type="forceDirectedGraph"
      data={{
        labels: data.nodes.map(n => n.label),
        datasets: [{
          data: data.nodes.map(() => ({})),
          edges: data.links.map(l => ({ source: nodeIndex.get(l.source), target: nodeIndex.get(l.target), requests: l.requests })),
          pointBackgroundColor: data.nodes.map(n => colors[groups.findIndex(g => g.key === n.group)]),
          pointRadius: 7,
          pointHoverRadius: 9,
          // `borderWidth` sets the width of both edges and nodes, so the nodes get their own `pointBorderWidth`
          borderWidth: ctx => 1 + ((ctx.raw as { requests?: number }).requests ?? 0) / 250,
          pointBorderWidth: 1,
          directed: true,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
        }],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const node = data.nodes[ctx.dataIndex]
                return [groups.find(g => g.key === node.group)?.label, formatLatency(node.latency), ...(node.alerts ? [formatAlerts(node.alerts)] : [])]
              },
            },
          },
        },
      }}
    />
  )
}
