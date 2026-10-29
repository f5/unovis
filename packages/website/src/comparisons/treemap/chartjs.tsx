import React from 'react'
import { Chart, LinearScale, Tooltip } from 'chart.js'
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap'
import { Chart as ReactChart } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, teams, formatCost } from './data'

Chart.register(TreemapController, TreemapElement, LinearScale, Tooltip)

// The treemap plugin has no default colors, so we use the Chart.js default palette, one color per team, at half opacity
// like the Colors plugin
const colors = ['#36a2eb80', '#ff638480', '#ff9f4080', '#ffcd5680', '#4bc0c080', '#9966ff80', '#c9cbcf80']

// Every tile carries its group: `g` is the team or service name, `v` its sum and `_data.children` the rows it sums up
type TreemapItem = { g: string; v: number; _data: { children: DataRecord[] } }
const teamOf = (item: TreemapItem): string => item._data.children[0].team

export default function ChartJsTreemap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#ccc' : '#333'
  return (
    <ReactChart
      type="treemap"
      data={{
        datasets: [{
          // The plugin groups the flat rows itself, by team and then by service
          tree: data,
          key: 'cost',
          groups: ['team', 'service'],
          backgroundColor: ctx => ctx.raw ? colors[teams.indexOf(teamOf(ctx.raw as TreemapItem)) % colors.length] : undefined,
          spacing: preset === 'rounded' ? 6 : 0.5,
          borderRadius: preset === 'rounded' ? 8 : 0,
          labels: {
            display: true,
            color: textColor,
            formatter: ctx => `${(ctx.raw as TreemapItem).g}: ${formatCost((ctx.raw as TreemapItem).v)}`,
          },
          // Group captions are on by default; the default chart turns them off like the other libraries
          captions: { display: preset === 'groups', color: textColor },
        }],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: () => '',
              label: ctx => `${(ctx.raw as TreemapItem).g}: ${formatCost((ctx.raw as TreemapItem).v)}`,
            },
          },
        },
      }}
    />
  )
}
