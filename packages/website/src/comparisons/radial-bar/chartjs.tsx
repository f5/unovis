import React from 'react'
import { Chart, ArcElement, Legend, Tooltip, Plugin } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, formatUsage, percentOfQuota, formatAverageUsage } from './data'

Chart.register(ArcElement, Legend, Tooltip)

// The Colors plugin colors a doughnut by data point, not by ring, so the rings take its palette by hand
const colors = ['#36a2eb', '#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0']

// Chart.js doesn't have a center label option, so we draw it with a custom plugin at the center of the rings
const centerLabel: Plugin<'doughnut', { text: string; color: string }> = {
  id: 'centerLabel',
  afterDraw: (chart, _, options) => {
    const { ctx } = chart
    const { x, y } = chart.getDatasetMeta(0).data[0]
    ctx.save()
    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = options.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(options.text, x, y)
    ctx.restore()
  },
}

export default function ChartJsRadialBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gauge = preset === 'gauge'
  const thick = preset === 'thick'
  return (
    <Doughnut
      data={{
        // There's no radial bar type: every ring is a doughnut dataset of the used share and the remainder, drawn as the
        // track. The rings share one scale, so the values are percent of the quota
        datasets: data.map((d, i) => ({
          label: d.label,
          data: [percentOfQuota(d), 100 - percentOfQuota(d)],
          backgroundColor: [colors[i], isDark ? '#444' : '#eee'],
          borderWidth: 0,
          // Rounds the corners of both arcs, so only the used share gets it
          borderRadius: preset === 'rounded' ? [8, 0] : 0,
        })),
      }}
      plugins={[centerLabel]}
      options={{
        maintainAspectRatio: false,
        // The rings split the space between the hole and the edge; there's no option for a gap between them
        cutout: thick ? '25%' : '50%',
        // Degrees, clockwise from 12 o'clock
        rotation: gauge ? -135 : 0,
        circumference: gauge ? 270 : 360,
        plugins: {
          // A doughnut's legend lists the data points, so it's rebuilt from the rings, and a click hides a ring
          legend: {
            labels: {
              color: textColor,
              generateLabels: chart => chart.data.datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: colors[i],
                strokeStyle: colors[i],
                fontColor: textColor,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
              })),
            },
            onClick: (_, item, legend) => {
              legend.chart.setDatasetVisibility(item.datasetIndex, !legend.chart.isDatasetVisible(item.datasetIndex))
              legend.chart.update()
            },
          },
          tooltip: {
            filter: item => item.dataIndex === 0,
            callbacks: { label: ctx => `${ctx.dataset.label}: ${formatUsage(data[ctx.datasetIndex])}` },
          },
          // @ts-expect-error Options of custom plugins aren't part of the Chart.js types
          centerLabel: { text: `${formatAverageUsage(data)} used`, color: textColor },
        },
      }}
    />
  )
}
