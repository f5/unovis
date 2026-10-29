import React from 'react'
import { Chart, LinearScale, Tooltip } from 'chart.js'
import { SankeyController, Flow } from 'chartjs-chart-sankey'
import { Chart as ReactChart } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { SankeyData, formatVisits } from './data'

Chart.register(SankeyController, Flow, LinearScale, Tooltip)

// The sankey plugin colors flows red to green by default, so we use the Chart.js default palette instead
const colors = ['#36a2eb', '#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#9966ff', '#c9cbcf']

export default function ChartJsSankey ({ data, isDark, preset }: ChartProps<SankeyData>): JSX.Element {
  const labels = Object.fromEntries(data.nodes.map(n => [n.id, n.label]))
  const color = (id: string): string => colors[data.nodes.findIndex(n => n.id === id) % colors.length]
  return (
    <ReactChart
      type="sankey"
      data={{
        datasets: [{
          data: data.links.map(l => ({ from: l.source, to: l.target, flow: l.value })),
          labels,
          colorFrom: ctx => color(ctx.dataset.data[ctx.dataIndex].from),
          colorTo: ctx => color(ctx.dataset.data[ctx.dataIndex].to),
          colorMode: preset === 'colors' ? 'from' : 'gradient',
          nodeWidth: preset === 'thin' ? 6 : 10,
          nodePadding: preset === 'thin' ? 24 : 10,
          color: isDark ? '#ccc' : '#333',
        }],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                const { from, to, flow } = ctx.raw as { from: string; to: string; flow: number }
                return `${labels[from]} → ${labels[to]}: ${formatVisits(flow)}`
              },
            },
          },
        },
      }}
    />
  )
}
