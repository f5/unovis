import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, formatUsage, percentOfQuota, formatAverageUsage } from './data'

export default function VegaLiteRadialBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const gauge = preset === 'gauge'
  const thick = preset === 'thick'
  // The rings are the bands of a radius scale, laid out in pixels from the outer edge inward: 16 px rings with 4 px gaps
  // (28 and 4 px for the thick rings), so `paddingInner` is the gap's share of a ring plus its gap
  const ringWidth = thick ? 28 : 16
  const ringGap = 4
  const rings = data.length * ringWidth + (data.length - 1) * ringGap
  const outerRadius = 'min(width, height) / 2'
  const cornerRadius = preset === 'rounded' ? 8 : 0
  // The rings share one angle scale, so the values are percent of the quota
  const values = data.map(d => ({ label: d.label, percent: percentOfQuota(d), used: formatUsage(d) }))
  // `sort: null` keeps the data order, and the reversed range puts the first record on the outer ring
  const radius = {
    field: 'label',
    type: 'nominal',
    sort: null,
    scale: { type: 'band', paddingInner: ringGap / (ringWidth + ringGap), paddingOuter: 0, range: [{ expr: outerRadius }, { expr: `${outerRadius} - ${rings}` }] },
  } as const
  // Arcs are stacked by default; unstacked, every bar starts at 0 like the track
  const theta = { type: 'quantitative', stack: null, scale: { domain: [0, 100], range: gauge ? [-0.75 * Math.PI, 0.75 * Math.PI] : [0, 2 * Math.PI] } } as const

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    layer: [
      // A track behind every ring, as in the Unovis chart
      {
        data: { values },
        mark: { type: 'arc', cornerRadius, fill: isDark ? '#444' : '#E7E9F3' },
        encoding: { radius, theta: { ...theta, datum: 100 } },
      },
      {
        data: { values },
        mark: { type: 'arc', cornerRadius },
        // Clicking a legend item highlights that ring and fades the others; shift-click adds one, clicking an empty spot clears
        params: [{ name: 'highlight', select: { type: 'point', fields: ['label'] }, bind: 'legend' }],
        encoding: {
          radius,
          theta: { ...theta, field: 'percent' },
          color: { field: 'label', type: 'nominal', sort: null, title: null },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
          tooltip: [{ field: 'label', title: 'Resource' }, { field: 'used', title: 'Used' }],
        },
      },
      {
        data: { values: [{ text: `${formatAverageUsage(data)} used` }] },
        // The dark theme recolors guides, not text marks
        mark: { type: 'text', fontSize: 16, fontWeight: 'bold', color: isDark ? '#fff' : 'black' },
        encoding: { text: { field: 'text' } },
      },
    ],
  }

  const options: EmbedOptions = { actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' } }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
