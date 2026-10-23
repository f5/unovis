import React from 'react'
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Colors, Tooltip } from 'chart.js'
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'

import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { Data, formatDay, formatValue } from './data'

// Callouts, bands and reference lines come from the Chart.js team's annotation plugin. It has to be registered, it
// doesn't work as an inline plugin, and it only draws on the charts that configure annotations
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Colors, Tooltip, annotationPlugin)

export default function ChartJsAnnotationsChart ({ data, isDark, preset }: ChartProps<Data>): JSX.Element {
  const { days, events, incident } = data
  const textColor = isDark ? '#aaa' : '#666'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  const annotations: Record<string, AnnotationOptions> = {}
  events.forEach(e => {
    // A label sits on its point; `yAdjust` (pixels) lifts it to the callout row and the callout line points back.
    // Labels don't wrap: `content` takes the lines, broken by hand
    annotations[e.id] = {
      type: 'label',
      xValue: formatDay(e.date),
      yValue: e.users,
      yAdjust: ({ chart }) => chart.scales.y.getPixelForValue(CALLOUT_VALUE) - chart.scales.y.getPixelForValue(e.users),
      position: { y: 'end' },
      content: [e.title, e.detail],
      color: textColor,
      font: preset === 'rich' ? [{ weight: 'bold' }, {}] : {},
      callout: { display: true, borderColor: textColor, borderWidth: 1, borderDash: preset === 'rings' ? [2, 2] : [] },
    }
    if (preset === 'rings') {
      annotations[`${e.id}-ring`] = { type: 'point', xValue: formatDay(e.date), yValue: e.users, radius: 6, backgroundColor: 'transparent', borderColor: textColor, borderWidth: 1 }
    }
  })
  if (preset === 'window') {
    // A box without `yMin` and `yMax` spans the plot's height
    annotations.incident = { type: 'box', xMin: formatDay(incident.start), xMax: formatDay(incident.end), backgroundColor: gridColor, borderWidth: 0, drawTime: 'beforeDatasetsDraw' }
    annotations.goal = {
      type: 'line',
      scaleID: 'y',
      value: GOAL,
      borderColor: textColor,
      borderWidth: 1,
      borderDash: [6, 4],
      label: { display: true, content: `Goal ${formatValue(GOAL)}`, position: 'start', color: textColor, backgroundColor: 'transparent', yAdjust: 10 },
    }
  }

  return (
    <Line
      data={{
        labels: days.map(d => formatDay(d.date)),
        datasets: [{ label: 'Active users', data: days.map(d => d.users), pointRadius: 0 }],
      }}
      options={{
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatValue(ctx.parsed.y)}` } },
          annotation: { annotations },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { min: 0, max: VALUE_MAX, ticks: { color: textColor, callback: value => formatValue(+value) }, grid: { color: gridColor } },
        },
      }}
    />
  )
}
