import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import { DataRecord, series, formatValue } from './data'

export default function VegaLiteGroupedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  // Vega-Lite draws one bar per row, so the records are unpivoted into one row per region and year
  const values = data.flatMap(d => series.map(s => ({ region: d.region, year: s.label, value: d[s.key] })))
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite formats with d3-format strings; the data.ts formatter is registered as a custom format type below
    config: { customFormatTypes: true },
    data: { values },
    // `sort: null` keeps the data's order, Vega-Lite sorts nominal domains alphabetically otherwise. It turns the labels
    // of a nominal x axis vertical by default
    encoding: { x: { field: 'region', type: 'nominal', sort: null, title: null } },
    layer: [
      {
        mark: 'bar',
        // Clicking a legend item highlights that year and fades the others; shift-click adds one, a click on an empty spot clears
        params: [{ name: 'highlight', select: { type: 'point', fields: ['year'] }, bind: 'legend' }],
        encoding: {
          // Bars are grouped by offsetting them within the region's band
          xOffset: { field: 'year' },
          y: { field: 'value', type: 'quantitative', title: null, axis: { formatType: 'formatValue' } },
          color: { field: 'year', type: 'nominal', title: null },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
        },
      },
      {
        // Invisible full-height bars carry one tooltip per region, with the years pivoted back into columns
        transform: [{ pivot: 'year', value: 'value', groupby: ['region'] }],
        mark: { type: 'bar', opacity: 0 },
        encoding: {
          tooltip: [
            // vega-tooltip shows a `title` key as the tooltip's heading
            { field: 'region', title: 'title' },
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
