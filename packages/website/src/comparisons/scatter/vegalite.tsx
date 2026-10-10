import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import { DataRecord, formatMass } from './data'

export default function VegaLiteScatterPlot ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite formats values with d3 format strings; a custom formatter is registered as a Vega expression function
    config: { customFormatTypes: true },
    // Vega writes an id into every row it ingests, and the page's rows are frozen once Recharts keeps them in its Immer store, so Vega gets copies
    data: { values: data.map(d => ({ ...d })) },
    // Clicking a legend item highlights that species and fades the others; shift-click adds one, clicking an empty spot clears
    params: [{ name: 'highlight', select: { type: 'point', fields: ['species'] }, bind: 'legend' }],
    mark: { type: 'point', filled: true },
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
  }

  const options: EmbedOptions = {
    actions: false,
    theme: isDark ? 'dark' : undefined,
    tooltip: { theme: isDark ? 'dark' : 'light' },
    expressionFunctions: { formatMass },
  }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
