import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import { DataRecord, series, formatValue } from './data'

export default function VegaLiteStackedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  // Vega-Lite stacks tidy data, one row per bar segment. The rank sets the stack order: by default the segments are
  // stacked by the color field, alphabetically from the top
  const values = data.flatMap(d => series.map((s, rank) => ({ month: d.month, priority: s.label, rank, tickets: d[s.key] })))
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite formats values with d3 format strings; the formatter from data.ts is registered as a Vega expression function
    config: { customFormatTypes: true },
    data: { values },
    // Nominal fields are sorted alphabetically by default, `sort: null` keeps the data order
    encoding: { x: { field: 'month', type: 'nominal', sort: null, title: null } },
    layer: [
      {
        mark: 'bar',
        // Clicking a legend item highlights that priority and fades the others; shift-click adds or removes one
        params: [{ name: 'highlight', select: { type: 'point', fields: ['priority'] }, bind: 'legend' }],
        encoding: {
          y: { field: 'tickets', type: 'quantitative', title: null, axis: { formatType: 'formatValue' } },
          color: { field: 'priority', type: 'nominal', sort: null, title: null },
          order: { field: 'rank' },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
        },
      },
      {
        // One tooltip for the whole stack, as in Vega-Lite's multi-series tooltip example: the priorities are pivoted back
        // into columns and shown on a rule per month, which the `nearest` hover picks anywhere in the plot
        transform: [{ pivot: 'priority', value: 'tickets', groupby: ['month'] }],
        // The dark theme doesn't recolor rules, so the hover rule would stay black
        mark: { type: 'rule', color: isDark ? 'white' : undefined },
        params: [{ name: 'hover', select: { type: 'point', fields: ['month'], nearest: true, on: 'pointerover', clear: 'pointerout' } }],
        encoding: {
          opacity: { condition: { param: 'hover', empty: false, value: 0.3 }, value: 0 },
          tooltip: [
            { field: 'month', type: 'nominal', title: 'Month' },
            ...series.map(s => ({ field: s.label, type: 'quantitative' as const, formatType: 'formatValue' })),
          ],
        },
      },
    ],
  }

  const options: EmbedOptions = {
    actions: false,
    theme: isDark ? 'dark' : undefined,
    tooltip: { theme: isDark ? 'dark' : 'light' },
    expressionFunctions: { formatValue },
  }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
