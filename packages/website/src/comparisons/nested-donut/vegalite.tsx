import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

const fields = ['platform', 'os', 'browser']

// The inner and outer radius of every ring, from the platforms to the browsers, as fractions of half the smaller view side
const rings = {
  default: [[0.25, 0.5], [0.5, 0.75], [0.75, 1]],
  inwards: [[0.75, 1], [0.5, 0.75], [0.25, 0.5]],
  widths: [[0.25, 0.386], [0.386, 0.591], [0.591, 1]],
}

export default function VegaLiteNestedDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Recharts freezes the rows it renders and Vega-Lite adds ids to them, so it gets copies. The index keeps the data order
  const values = data.map((d, index) => ({ ...d, index }))
  const radii = rings[preset === 'inwards' || preset === 'widths' ? preset : 'default']
  const total = data.reduce((sum, d) => sum + d.sessions, 0)
  const radius = (fraction: number): { expr: string } => ({ expr: `min(width, height) / 2 * ${fraction}` })

  // Vega-Lite has no hierarchy layout, so every ring is a layer of its own: it sums the sessions of each group, then runs a
  // cumulative sum in data order for the angles each segment starts and ends at. Every ring adds up to the same total, and
  // the rings share the theta scale, so the segments line up with their parents
  const ringLayers = fields.map((field, level) => ({
    transform: [
      { aggregate: [{ op: 'sum', field: 'sessions', as: 'value' }, { op: 'min', field: 'index', as: 'order' }], groupby: fields.slice(0, level + 1) },
      { window: [{ op: 'sum', field: 'value', as: 'end' }], sort: [{ field: 'order' }] },
      { joinaggregate: [{ op: 'sum', field: 'value', as: 'total' }] },
      { calculate: 'datum.end - datum.value', as: 'start' },
      { calculate: '(datum.start + datum.end) / 2', as: 'middle' },
      { calculate: `datum['${field}']`, as: 'name' },
    ],
    layer: [
      {
        // Segments of one platform share its color, so a stroke in the background color separates them
        mark: { type: 'arc', innerRadius: radius(radii[level][0]), outerRadius: radius(radii[level][1]), stroke: isDark ? '#1b1b1d' : 'white' },
        encoding: {
          // The theta scale's range is the angle span in radians, clockwise from 12 o'clock. Its domain only covers the
          // `theta` fields, not `theta2`, so it's set to the total
          theta: { field: 'start', type: 'quantitative', stack: null, scale: { domain: [0, total], range: preset === 'half' ? [-Math.PI / 2, Math.PI / 2] : [0, 2 * Math.PI] } },
          theta2: { field: 'end' },
          // Every segment takes the color of its platform. `sort: null` keeps the data order
          color: { field: 'platform', type: 'nominal', sort: null, legend: null },
          tooltip: [{ field: 'name', title: 'Name' }, { field: 'value', title: 'Sessions', formatType: 'formatValue' }],
        },
      },
      {
        // Text marks have no overflow check, so the labels of segments under 4% of the total are left out
        transform: [{ filter: 'datum.value / datum.total > 0.04' }],
        // The dark theme recolors guides, not text marks
        mark: { type: 'text', radius: radius((radii[level][0] + radii[level][1]) / 2), color: isDark ? '#fff' : 'black' },
        encoding: {
          theta: { field: 'middle', type: 'quantitative', stack: null },
          text: { field: 'name' },
        },
      },
    ],
  }))

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite formats values with d3 format strings; the formatter from data.ts is registered as a Vega expression function
    config: { customFormatTypes: true },
    data: { values },
    layer: ringLayers,
  } as TopLevelSpec

  const options: EmbedOptions = {
    actions: false,
    theme: isDark ? 'dark' : undefined,
    tooltip: { theme: isDark ? 'dark' : 'light' },
    expressionFunctions: { formatValue },
  }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
