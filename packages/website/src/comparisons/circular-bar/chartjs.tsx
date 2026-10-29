import React from 'react'
import { Chart, RadialLinearScale, ArcElement, Colors, Legend, Tooltip } from 'chart.js'
import { PolarArea } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, percentOfGoal } from './data'

Chart.register(RadialLinearScale, ArcElement, Colors, Legend, Tooltip)

export default function ChartJsCircularBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const half = preset === 'half'
  return (
    <PolarArea
      data={{
        labels: data.map(d => d.label),
        // The polar area chart has one radial scale for every slice, so the values are percent of the goal.
        // It has no hole in the middle and no background track: a second dataset would be drawn as an inner ring
        datasets: [{
          data: data.map(percentOfGoal),
          borderWidth: 0,
          borderRadius: preset === 'square' ? 0 : 12,
          // `spacing` trims every slice by an angle, so the gaps widen towards the edge. The polar area chart doesn't
          // make room for it, so the slices also get longer by half the spacing
          spacing: preset === 'gaps' ? 32 : 4,
          // Every slice covers `angle` degrees, a full circle split evenly by default. The circle stays centered, so a
          // half circle leaves the bottom of the chart empty
          angle: half ? 180 / data.length : undefined,
        }],
      }}
      options={{
        maintainAspectRatio: false,
        // The first slice starts at the scale's `startAngle`; half a slot back centers it at the top
        scales: { r: { min: 0, max: 100, startAngle: half ? -90 : -180 / data.length, ticks: { display: false }, grid: { display: false }, angleLines: { display: false } } },
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => formatValue(data[ctx.dataIndex]) } },
        },
      }}
    />
  )
}
