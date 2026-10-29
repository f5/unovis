import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, formatMs } from './data'

// Kept at module level: react-vega re-embeds the chart when the options object changes
const embedOptions = { actions: false, expressionFunctions: { formatMs } }
const darkOptions: EmbedOptions = { ...embedOptions, theme: 'dark', tooltip: { theme: 'dark' } }
const lightOptions: EmbedOptions = { ...embedOptions, tooltip: { theme: 'light' } }

export default function VegaLiteBoxPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Vega-Lite computes the statistics from one row per sample
  const values = data.flatMap(d => d.samples.map(value => ({ endpoint: d.endpoint, value })))
  const endpoints = data.map(d => d.endpoint)
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite formats with d3-format strings; the data.ts formatter is registered as a custom format type. The
    // boxplot's tooltip doesn't take the y channel's format, so `tooltipFormat` sets it for every tooltip number
    config: { customFormatTypes: true, tooltipFormat: { numberFormatType: 'formatMs' } },
    data: { values },
    mark: {
      type: 'boxplot',
      // `extent` is 1.5 (Tukey whiskers and outlier points) by default; `'min-max'` puts the whiskers at the extremes
      extent: preset === 'min-max' ? 'min-max' : 1.5,
      box: preset === 'rounded' ? { cornerRadius: 8 } : {},
      // The dark theme doesn't recolor rules, so the whiskers would stay black
      rule: isDark ? { color: '#ccc' } : {},
    },
    encoding: {
      // Vega-Lite sorts nominal domains alphabetically, and `sort: null` doesn't keep the data's order after the boxplot's
      // aggregation, so the order is given explicitly
      x: { field: 'endpoint', type: 'nominal', sort: endpoints, title: null, axis: { labelAngle: 0 } },
      // The tooltip lists the box's statistics with the channel's title, e.g. "Q3 of Response time"
      y: { field: 'value', type: 'quantitative', title: 'Response time', axis: { title: null, formatType: 'formatMs' } },
      ...(preset === 'colors' ? { color: { field: 'endpoint', type: 'nominal', sort: endpoints, legend: null } } : {}),
    },
  }

  return <VegaEmbed spec={spec} options={isDark ? darkOptions : lightOptions} style={{ height: '100%' }}/>
}
