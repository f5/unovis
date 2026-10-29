import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

export default function VegaLiteGroupedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Vega-Lite draws one bar per row, so the records are unpivoted into one row per region and year
  const values = data.flatMap(d => series.map(s => ({ region: d.region, year: s.label, value: d[s.key] })))
  const horizontal = preset === 'horizontal'
  // `sort: null` keeps the data's order, Vega-Lite sorts nominal domains alphabetically otherwise. It turns the labels
  // of a nominal x axis vertical by default; `labelLimit` trims them with an ellipsis once they're turned back
  const region = {
    field: 'region',
    type: 'nominal' as const,
    sort: null,
    title: null,
    axis: preset === 'trim-labels' ? { labelAngle: 0, labelLimit: 70 } : undefined,
  }
  const value = { field: 'value', type: 'quantitative' as const, title: null, axis: { formatType: 'formatValue' } }
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite formats with d3-format strings; the data.ts formatter is registered as a custom format type below
    config: { customFormatTypes: true },
    data: { values },
    // Horizontal bars swap the channels: the regions go on `y` and the years are offset along it
    encoding: horizontal ? { y: region } : { x: region },
    layer: [
      {
        mark: 'bar',
        // Clicking a legend item highlights that year and fades the others; shift-click adds one, a click on an empty spot clears
        params: [{ name: 'highlight', select: { type: 'point', fields: ['year'] }, bind: 'legend' }],
        encoding: {
          // Bars are grouped by offsetting them within the region's band
          ...(horizontal ? { yOffset: { field: 'year' }, x: value } : { xOffset: { field: 'year' }, y: value }),
          color: { field: 'year', type: 'nominal', title: null },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
        },
      },
      {
        // Invisible bars across each region's whole band carry one tooltip per region, with the years pivoted back into columns
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
