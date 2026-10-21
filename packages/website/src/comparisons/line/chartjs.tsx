import React from 'react'
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Colors, Legend, Tooltip } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

// Bands and reference lines come from the Chart.js team's annotation plugin. It has to be registered, it doesn't work as
// an inline plugin, and it only draws on the charts that configure annotations
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Colors, Legend, Tooltip, annotationPlugin)

const TARGET = 50

export default function ChartJsLineChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  // The months the iOS app reported no data, for the "Annotations" preset
  const outage = data.filter(d => d.ios === undefined)

  return (
    <Line
      data={{
        labels: data.map(d => formatMonth(d.date)),
        // `spanGaps` bridges the missing months and the segment style makes those bridges dashed
        datasets: series.map(s => ({
          label: s.label,
          data: data.map(d => d[s.key] ?? null),
          pointRadius: 0,
          spanGaps: true,
          stepped: preset === 'step' ? 'middle' : false,
          borderDash: preset === 'dashed' && s.key === 'ios' ? [6, 4] : [],
          segment: { borderDash: ctx => ctx.p0.skip || ctx.p1.skip ? [6, 6] : undefined },
        })),
      }}
      options={{
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatValue(ctx.parsed.y)}` } },
          // A box without `yMin` and `yMax` spans the plot's height, and the y axis stretches to show the target line
          annotation: {
            annotations: preset === 'annotations' && outage.length > 0 ? {
              outage: {
                type: 'box',
                xMin: formatMonth(outage[0].date),
                xMax: formatMonth(outage[outage.length - 1].date),
                backgroundColor: gridColor,
                borderWidth: 0,
                drawTime: 'beforeDatasetsDraw',
                label: { display: true, content: 'iOS outage', position: 'start', color: textColor },
              },
              target: {
                type: 'line',
                scaleID: 'y',
                value: TARGET,
                borderColor: textColor,
                borderWidth: 1,
                borderDash: [6, 4],
                label: { display: true, content: `Target ${formatValue(TARGET)}`, position: 'end', color: textColor, backgroundColor: 'transparent', yAdjust: -10 },
              },
            } : {},
          },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, callback: value => formatValue(+value) }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
