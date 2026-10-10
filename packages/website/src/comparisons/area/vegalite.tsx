import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import { DataRecord, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)

// Vega-Lite formats values with d3-format strings; the formatters from data.ts are registered as Vega expression
// functions and used as custom format types. Axis labels get timestamps, so the month formatter turns them into dates
const expressionFunctions = {
  formatMonth: (date: number | Date): string => formatMonth(new Date(date)),
  formatValue,
}

export default function VegaLiteAreaChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  // Vega-Lite stacks tidy data by the color field, so the records are unpivoted into one row per month and service
  const values = data.flatMap(d => series.map(s => ({ date: d.date, series: s.label, value: d[s.key] })))
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    config: { customFormatTypes: true },
    data: { values },
    encoding: { x: { field: 'date', type: 'temporal', title: null, axis: { formatType: 'formatMonth' } } },
    layer: [
      {
        mark: 'area',
        // Clicking a legend item highlights that series and fades the others; shift-click adds one, a click beside the plot clears
        params: [{ name: 'highlight', select: { type: 'point', fields: ['series'] }, bind: 'legend' }],
        encoding: {
          y: { field: 'value', type: 'quantitative', title: null, axis: { formatType: 'formatValue' } },
          // The domain keeps the data's series order; Vega-Lite stacks the first series on top, as listed in the legend
          color: { field: 'series', type: 'nominal', title: null, scale: { domain: labels } },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
        },
      },
      {
        // A shared tooltip per month, as in Vega-Lite's multi-line tooltip example: the series are pivoted back into
        // columns and shown on an invisible rule that the nearest pointer position reveals
        transform: [{ pivot: 'series', value: 'value', groupby: ['date'] }],
        // The dark theme doesn't recolor rules, so the hover rule would stay black
        mark: { type: 'rule', color: isDark ? 'white' : undefined },
        params: [{ name: 'hover', select: { type: 'point', fields: ['date'], nearest: true, on: 'pointerover', clear: 'pointerout' } }],
        encoding: {
          opacity: { condition: { param: 'hover', value: 0.3, empty: false }, value: 0 },
          tooltip: [
            { field: 'date', type: 'temporal', title: 'Month', formatType: 'formatMonth' },
            ...labels.map(label => ({ field: label, type: 'quantitative' as const, formatType: 'formatValue' })),
          ],
        },
      },
    ],
  }

  const options: EmbedOptions = { actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' }, expressionFunctions }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
