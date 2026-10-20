import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, percentOfGoal } from './data'

export default function VegaLiteCircularBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Every bar is an arc with its own start and end angle: equal slots around the circle minus a gap, the first one
  // centered at the top. Stacking a constant field by `theta` would give equal slots too, but `padAngle` pads short and
  // long bars by different angles. The bars share one radius scale, so the values are percent of the goal.
  // A half circle starts at the left and stays centered, so it leaves the bottom of the chart empty
  const half = preset === 'half'
  const slot = (half ? Math.PI : 2 * Math.PI) / data.length
  const offset = half ? -Math.PI / 2 + slot / 2 : 0
  const gap = preset === 'gaps' ? 0.4 : 0.15
  const cornerRadius = preset === 'square' ? 0 : 10
  const values = data.map((d, i) => ({
    label: d.label,
    percent: percentOfGoal(d),
    today: formatValue(d),
    start: offset + (i - 0.5 + gap / 2) * slot,
    end: offset + (i + 0.5 - gap / 2) * slot,
  }))

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    data: { values },
    encoding: {
      theta: { field: 'start', type: 'quantitative', scale: { domain: [0, 2 * Math.PI] } },
      theta2: { field: 'end' },
      radius2: { datum: 0 },
    },
    layer: [
      // A track behind every bar, as in the Unovis and ECharts charts
      { mark: { type: 'arc', cornerRadius, fill: isDark ? '#444' : '#E7E9F3' }, encoding: { radius: { datum: 100 } } },
      {
        mark: { type: 'arc', cornerRadius },
        // Clicking a legend item highlights that bar and fades the others; shift-click adds one, clicking an empty spot clears
        params: [{ name: 'highlight', select: { type: 'point', fields: ['label'] }, bind: 'legend' }],
        encoding: {
          // The radius scale defaults to `sqrt`; its range starts at the hole's radius so every bar grows from the hole
          radius: { field: 'percent', type: 'quantitative', scale: { type: 'linear', domain: [0, 100], rangeMin: 60 } },
          color: { field: 'label', type: 'nominal', sort: null, legend: { title: null } },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
          tooltip: [{ field: 'label', title: 'Metric' }, { field: 'today', title: 'Today' }],
        },
      },
    ],
  }

  const options: EmbedOptions = { actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' } }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
