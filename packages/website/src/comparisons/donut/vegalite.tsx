import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'

import { DataRecord, formatValue, getTotal } from './data'

export default function VegaLiteDonutChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  // Vega-Lite formats numbers with d3-format strings, so the shared formatter runs before the data goes in. The index
  // keeps the slices in data order: Vega-Lite stacks the arcs in the alphabetical order of the color field otherwise
  const values = data.map((d, i) => ({ ...d, index: i, label: formatValue(d.sessions) }))

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    layer: [
      {
        data: { values },
        // The arcs' outer radius defaults to half the smaller side, so the hole is 60% of it
        mark: { type: 'arc', innerRadius: { expr: 'min(width, height) * 0.3' } },
        // Clicking a legend item highlights its slice and fades the others; shift-click adds one, clicking an empty spot clears
        params: [{ name: 'highlight', select: { type: 'point', fields: ['source'] }, bind: 'legend' }],
        encoding: {
          theta: { field: 'sessions', type: 'quantitative' },
          order: { field: 'index', type: 'quantitative' },
          // `sort: null` keeps the data order in the legend too
          color: { field: 'source', type: 'nominal', sort: null, title: null },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
          tooltip: [{ field: 'source', title: 'Source' }, { field: 'label', title: 'Sessions' }],
        },
      },
      {
        data: { values: [{ total: `${formatValue(getTotal(data))} total` }] },
        // A text mark without x and y sits in the middle of the view. The dark theme recolors guides, not text marks
        mark: { type: 'text', fontSize: 16, fontWeight: 'bold', color: isDark ? '#fff' : 'black' },
        encoding: { text: { field: 'total' } },
      },
    ],
  }

  return (
    <VegaEmbed
      spec={spec}
      options={{ actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' } }}
      style={{ height: '100%' }}
    />
  )
}
