import React from 'react'
import { Chart, RadialLinearScale, ArcElement, Colors, Legend, Tooltip } from 'chart.js'
import { PolarArea } from 'react-chartjs-2'

import { DataRecord, formatValue, percentOfGoal } from './data'

Chart.register(RadialLinearScale, ArcElement, Colors, Legend, Tooltip)

export default function ChartJsCircularBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  return (
    <PolarArea
      data={{
        labels: data.map(d => d.label),
        // The polar area chart has one radial scale for every slice, so the values are percent of the goal.
        // It has no hole in the middle and no background track: a second dataset would be drawn as an inner ring
        datasets: [{ data: data.map(percentOfGoal), borderWidth: 0, borderRadius: 12, spacing: 4 }],
      }}
      options={{
        maintainAspectRatio: false,
        // The first slice starts at the scale's `startAngle`; half a slot back centers it at the top
        scales: { r: { min: 0, max: 100, startAngle: -180 / data.length, ticks: { display: false }, grid: { display: false }, angleLines: { display: false } } },
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => formatValue(data[ctx.dataIndex]) } },
        },
      }}
    />
  )
}
