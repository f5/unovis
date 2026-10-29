import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { CALLOUT_VALUE, GOAL, VALUE_MAX } from './constants'
import { Data, formatDay, formatValue } from './data'

const x = { field: 'date', type: 'temporal', title: null, axis: { formatType: 'formatDay' } } as const
// One layer of a layered spec
type Layer = Extract<TopLevelSpec, { layer: unknown }>['layer'][number]

// Vega-Lite formats with d3-format strings: the data.ts formatters are registered as Vega expression functions
// and used as custom format types
const expressionFunctions = {
  // Temporal values reach the formatter as dates in the tooltip and as timestamps on the axis
  formatDay: (date: Date | number): string => formatDay(new Date(date)),
  formatValue,
}

export default function VegaLiteAnnotationsChart ({ data, isDark, preset }: ChartProps<Data>): JSX.Element {
  const { days, events, incident } = data
  // The dark theme doesn't restyle rules, points and text, which are black by default
  const markColor = isDark ? 'white' : undefined

  // Every callout is a rule from the day's value up to the callout row, with text above it. Text doesn't wrap: an array
  // of strings is drawn as lines, and a mark has one font weight, so the rich headline is a text layer of its own
  const callouts: Layer = {
    data: { values: events.map(e => ({ ...e, lines: [e.title, e.detail] })) },
    encoding: { x },
    layer: [
      { mark: { type: 'rule', color: markColor, strokeDash: preset === 'rings' ? [2, 2] : undefined }, encoding: { y: { field: 'users', type: 'quantitative' }, y2: { datum: CALLOUT_VALUE } } },
      ...(preset === 'rich' ? [
        { mark: { type: 'text', baseline: 'bottom', dy: -18, fontWeight: 'bold', color: markColor }, encoding: { y: { datum: CALLOUT_VALUE }, text: { field: 'title' } } },
        { mark: { type: 'text', baseline: 'bottom', dy: -4, color: markColor }, encoding: { y: { datum: CALLOUT_VALUE }, text: { field: 'detail' } } },
      ] as Layer[] : [
        // The baseline applies to the first line, so the two lines are lifted by one more
        { mark: { type: 'text', baseline: 'bottom', dy: -18, color: markColor }, encoding: { y: { datum: CALLOUT_VALUE }, text: { field: 'lines' } } },
      ] as Layer[]),
      ...(preset === 'rings' ? [
        { mark: { type: 'point', size: 150, color: markColor }, encoding: { y: { field: 'users', type: 'quantitative' } } },
      ] as Layer[] : []),
    ],
  }

  // A `rect` with only `x` and `x2` spans the view's height, and a `rule` with only `y` spans its width
  const incidentWindow: Layer[] = [
    { data: { values: [{ ...incident }] }, mark: { type: 'rect', color: 'gray', opacity: 0.15 }, encoding: { x: { ...x, field: 'start' }, x2: { field: 'end' } } },
    {
      data: { values: [{}] },
      encoding: { y: { datum: GOAL } },
      layer: [
        { mark: { type: 'rule', strokeDash: [6, 4], color: markColor } },
        { mark: { type: 'text', align: 'left', baseline: 'top', x: 0, dx: 4, dy: 4, text: `Goal ${formatValue(GOAL)}`, color: markColor } },
      ],
    },
  ]

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    // Vega-Lite adds ids to the rows, so they're copied
    data: { values: days.map(d => ({ ...d })) },
    config: { customFormatTypes: true },
    layer: [
      ...(preset === 'window' ? incidentWindow : []),
      {
        mark: 'line',
        encoding: {
          x,
          y: { field: 'users', type: 'quantitative', title: null, scale: { domain: [0, VALUE_MAX] }, axis: { formatType: 'formatValue' } },
        },
      },
      callouts,
      {
        // A transparent rule per day carries the tooltip
        mark: { type: 'rule', color: markColor },
        params: [{ name: 'hover', select: { type: 'point', fields: ['date'], nearest: true, on: 'pointerover', clear: 'pointerout' } }],
        encoding: {
          x,
          opacity: { condition: { param: 'hover', value: 0.3, empty: false }, value: 0 },
          tooltip: [
            { field: 'date', type: 'temporal', title: 'Day', formatType: 'formatDay' },
            { field: 'users', type: 'quantitative', title: 'Active users', formatType: 'formatValue' },
          ],
        },
      },
    ],
  }

  const options: EmbedOptions = { actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' }, expressionFunctions }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
