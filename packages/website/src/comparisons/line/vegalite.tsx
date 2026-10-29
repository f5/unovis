import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

const labels = series.map(s => s.label)
const TARGET = 50
// The layers that follow the dates share this x encoding; the target line leaves it out to span the view's width
const x = { field: 'date', type: 'temporal', title: null, axis: { formatType: 'formatMonth' } } as const
// One layer of a layered spec, for the layers the "Annotations" preset adds
type Layer = Extract<TopLevelSpec, { layer: unknown }>['layer'][number]

// Vega-Lite formats with d3-format strings: the data.ts formatters are registered as Vega expression functions
// and used as custom format types
const expressionFunctions = {
  // Temporal values reach the formatter as dates in the tooltip and as timestamps on the axis
  formatMonth: (date: Date | number): string => formatMonth(new Date(date)),
  // The pivot leaves a series' value undefined in the months it has no data
  formatValue: (value: number | undefined): string => value === undefined ? 'No data' : formatValue(value),
}

export default function VegaLiteLineChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // The months the iOS app reported no data, for the "Annotations" preset. A `rect` with only `x` and `x2` spans the
  // view's height, and a `rule` with only `y` spans its width
  const outage = data.filter(d => d.ios === undefined)
  const outageBand: Layer = {
    data: { values: outage.length > 0 ? [{ start: outage[0].date, end: outage[outage.length - 1].date }] : [] },
    encoding: { x: { ...x, field: 'start' } },
    layer: [
      { mark: { type: 'rect', color: 'gray', opacity: 0.15 }, encoding: { x2: { field: 'end' } } },
      // The dark theme doesn't restyle rules and text, which are black by default
      { mark: { type: 'text', align: 'left', baseline: 'top', dx: 4, y: 8, text: 'iOS outage', color: isDark ? 'white' : undefined } },
    ],
  }
  const targetLine: Layer = {
    data: { values: [{}] },
    encoding: { y: { datum: TARGET } },
    layer: [
      { mark: { type: 'rule', strokeDash: [6, 4], color: isDark ? 'white' : undefined } },
      { mark: { type: 'text', align: 'right', baseline: 'bottom', x: 'width', dy: -4, text: `Target ${formatValue(TARGET)}`, color: isDark ? 'white' : undefined } },
    ],
  }

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite draws one line per color from tidy (long) data, so the wide records are unpivoted
    data: { values: data.flatMap(d => series.map(s => ({ date: d.date, platform: s.label, users: d[s.key] }))) },
    config: { customFormatTypes: true },
    layer: [
      ...(preset === 'annotations' ? [outageBand] : []),
      {
        // Missing months leave gaps: the default `invalid` mode breaks lines at missing values
        mark: { type: 'line', interpolate: preset === 'step' ? 'step' : 'linear' },
        // Clicking a legend item highlights that series and fades the others; shift-click adds one, a click beside the
        // plot clears the highlight
        params: [{ name: 'highlight', select: { type: 'point', fields: ['platform'] }, bind: 'legend' }],
        encoding: {
          x,
          y: { field: 'users', type: 'quantitative', title: null, axis: { formatType: 'formatValue' } },
          color: { field: 'platform', type: 'nominal', title: null, scale: { domain: labels } },
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
          // The dash pattern is a channel like color: the scale maps iOS to dashes and the other series to solid lines
          ...(preset === 'dashed' && {
            strokeDash: { field: 'platform', type: 'nominal', title: null, scale: { domain: labels, range: labels.map(label => label === 'iOS' ? [6, 4] : [1, 0]) } },
          }),
        },
      },
      ...(preset === 'annotations' ? [targetLine] : []),
      {
        // A transparent rule per month carries the shared tooltip, as in Vega-Lite's multi-series tooltip example:
        // the pivot turns the series back into one column each
        transform: [{ pivot: 'platform', value: 'users', groupby: ['date'] }],
        // The dark theme doesn't restyle rules, which are black by default
        mark: { type: 'rule', color: isDark ? 'white' : undefined },
        params: [{ name: 'hover', select: { type: 'point', fields: ['date'], nearest: true, on: 'pointerover', clear: 'pointerout' } }],
        encoding: {
          x,
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
