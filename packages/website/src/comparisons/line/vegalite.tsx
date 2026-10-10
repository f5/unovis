import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import { DataRecord, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)

// Vega-Lite formats with d3-format strings: the data.ts formatters are registered as Vega expression functions
// and used as custom format types
const expressionFunctions = {
  // Temporal values reach the formatter as dates in the tooltip and as timestamps on the axis
  formatMonth: (date: Date | number): string => formatMonth(new Date(date)),
  // The pivot leaves a series' value undefined in the months it has no data
  formatValue: (value: number | undefined): string => value === undefined ? 'No data' : formatValue(value),
}

export default function VegaLiteLineChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite draws one line per color from tidy (long) data, so the wide records are unpivoted
    data: { values: data.flatMap(d => series.map(s => ({ date: d.date, platform: s.label, users: d[s.key] }))) },
    config: { customFormatTypes: true },
    encoding: { x: { field: 'date', type: 'temporal', title: null, axis: { formatType: 'formatMonth' } } },
    layer: [
      {
        // Missing months leave gaps: the default `invalid` mode breaks lines at missing values
        mark: 'line',
        // Clicking a legend item highlights that series and fades the others; shift-click adds one, a click beside the
        // plot clears the highlight
        params: [{ name: 'highlight', select: { type: 'point', fields: ['platform'] }, bind: 'legend' }],
        encoding: {
          y: { field: 'users', type: 'quantitative', title: null, axis: { formatType: 'formatValue' } },
          color: { field: 'platform', type: 'nominal', title: null, scale: { domain: labels } },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
        },
      },
      {
        // A transparent rule per month carries the shared tooltip, as in Vega-Lite's multi-series tooltip example:
        // the pivot turns the series back into one column each
        transform: [{ pivot: 'platform', value: 'users', groupby: ['date'] }],
        // The dark theme doesn't restyle rules, which are black by default
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
