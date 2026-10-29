import React from 'react'
import { Chart, ArcElement, Colors, Legend, Tooltip, Plugin } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, getTotal } from './data'

Chart.register(ArcElement, Colors, Legend, Tooltip)

// Chart.js doesn't have a center label option, so we draw it with a custom plugin at the center of the arcs
const centerLabel: Plugin<'doughnut', { text: string; color: string; baseline: CanvasTextBaseline }> = {
  id: 'centerLabel',
  afterDraw: (chart, _, options) => {
    const { ctx } = chart
    const { x, y } = chart.getDatasetMeta(0).data[0]
    ctx.save()
    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = options.color
    ctx.textAlign = 'center'
    ctx.textBaseline = options.baseline
    ctx.fillText(options.text, x, y)
    ctx.restore()
  },
}

export default function ChartJsDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#ccc' : '#666'
  return (
    <Doughnut
      data={{
        labels: data.map(d => d.source),
        datasets: [{
          data: data.map(d => d.sessions),
          spacing: preset === 'rounded' ? 4 : 0,
          borderRadius: preset === 'rounded' ? 6 : 0,
        }],
      }}
      plugins={[centerLabel]}
      options={{
        maintainAspectRatio: false,
        // Degrees, clockwise from 12 o'clock
        rotation: preset === 'half' ? -90 : 0,
        circumference: preset === 'half' ? 180 : 360,
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => formatValue(ctx.parsed) } },
          // The half ring's center is at the bottom of the chart, so the label sits on top of it
          // @ts-expect-error Options of custom plugins aren't part of the Chart.js types
          centerLabel: { text: `${formatValue(getTotal(data))} total`, color: textColor, baseline: preset === 'half' ? 'bottom' : 'middle' },
        },
      }}
    />
  )
}
