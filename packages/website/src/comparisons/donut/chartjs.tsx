import React from 'react'
import { Chart, ArcElement, Colors, Legend, Tooltip, Plugin } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

import { DataRecord, formatValue, getTotal } from './data'

Chart.register(ArcElement, Colors, Legend, Tooltip)

// Chart.js doesn't have a center label option, so we draw it with a custom plugin
const centerLabel: Plugin<'doughnut', { text: string; color: string }> = {
  id: 'centerLabel',
  afterDraw: (chart, _, options) => {
    const { ctx, chartArea: { left, right, top, bottom } } = chart
    ctx.save()
    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = options.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(options.text, (left + right) / 2, (top + bottom) / 2)
    ctx.restore()
  },
}

export default function ChartJsDonutChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const textColor = isDark ? '#ccc' : '#666'
  return (
    <Doughnut
      data={{
        labels: data.map(d => d.source),
        datasets: [{ data: data.map(d => d.sessions) }],
      }}
      plugins={[centerLabel]}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor } },
          tooltip: { callbacks: { label: ctx => formatValue(ctx.parsed) } },
          // @ts-expect-error Options of custom plugins aren't part of the Chart.js types
          centerLabel: { text: `${formatValue(getTotal(data))} total`, color: textColor },
        },
      }}
    />
  )
}
