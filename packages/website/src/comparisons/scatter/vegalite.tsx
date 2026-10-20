import React from 'react'
import { mean } from 'd3-array'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, formatMass } from './data'

export default function VegaLiteScatterPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const averageFlipper = mean(data, d => d.flipperLength)
  const averageBill = mean(data, d => d.billLength)

  const points = {
    // Vega writes an id into every row it ingests, and the page's rows are frozen once Recharts keeps them in its Immer store, so Vega gets copies
    data: { values: data.map(d => ({ ...d })) },
    // Clicking a legend item highlights that species and fades the others; shift-click adds one, clicking an empty spot clears
    params: [{ name: 'highlight', select: { type: 'point', fields: ['species'] }, bind: 'legend' }],
    // Points are hollow unless `filled`
    mark: preset === 'rings' ? { type: 'point', strokeWidth: 1.5 } : { type: 'point', filled: true },
    encoding: {
      // Quantitative x and y scales start at zero by default
      x: { field: 'flipperLength', type: 'quantitative', title: 'Flipper length (mm)', scale: { zero: false } },
      y: { field: 'billLength', type: 'quantitative', title: 'Bill length (mm)', scale: { zero: false } },
      size: { field: 'bodyMass', type: 'quantitative', legend: null },
      // Color and shape encode the same field, so Vega-Lite merges their legends into one
      color: { field: 'species', type: 'nominal', title: null },
      shape: { field: 'species', type: 'nominal', scale: { range: ['circle', 'triangle-up', 'square'] }, title: null },
      opacity: { condition: { param: 'highlight', value: 0.7 }, value: 0.2 },
      tooltip: [
        { field: 'species', type: 'nominal', title: 'Species' },
        { field: 'flipperLength', type: 'quantitative', title: 'Flipper length (mm)' },
        { field: 'billLength', type: 'quantitative', title: 'Bill length (mm)' },
        { field: 'bodyMass', type: 'quantitative', title: 'Body mass', formatType: 'formatMass' },
      ],
    },
  } satisfies TopLevelSpec

  // Reference lines are layers on the same scales as the points. A mark is drawn per row of data, so they get one row of their
  // own; the dark theme colors axes and legends but not marks, so they get a color too
  const averages = {
    data: { values: [{}] },
    encoding: { color: { value: isDark ? '#ddd' : 'black' } },
    layer: [
      { mark: { type: 'rule', strokeDash: [6, 4] }, encoding: { x: { datum: averageFlipper } } },
      { mark: { type: 'rule', strokeDash: [6, 4] }, encoding: { y: { datum: averageBill } } },
      { mark: { type: 'text', align: 'left', baseline: 'top', dx: 4, y: 4 }, encoding: { x: { datum: averageFlipper }, text: { value: `Average ${averageFlipper.toFixed(0)} mm` } } },
      { mark: { type: 'text', align: 'left', baseline: 'bottom', x: 4, dy: -4 }, encoding: { y: { datum: averageBill }, text: { value: `Average ${averageBill.toFixed(1)} mm` } } },
    ],
  } satisfies TopLevelSpec

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite formats values with d3 format strings; a custom formatter is registered as a Vega expression function
    config: { customFormatTypes: true },
    ...preset === 'averages' ? { layer: [points, averages] } : points,
  }

  const options: EmbedOptions = {
    actions: false,
    theme: isDark ? 'dark' : undefined,
    tooltip: { theme: isDark ? 'dark' : 'light' },
    expressionFunctions: { formatMass },
  }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
