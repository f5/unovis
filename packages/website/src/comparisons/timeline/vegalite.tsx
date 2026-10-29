import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DEPLOYMENT_ICON_PATH, ICON_SIZE, INCIDENT_ICON_PATH, WEEK_END, WEEK_START } from './constants'
import { TimelineEvent, kinds, services, formatDay, formatRange, getKindLabel } from './data'

// Vega-Lite formats with d3-format strings: the data.ts formatter is registered as a Vega expression function and used
// as a custom format type. Axis values reach it as timestamps
const expressionFunctions = { formatDay }
// One layer of a layered spec, for the icons
type Layer = Extract<TopLevelSpec, { layer: unknown }>['layer'][number]

export default function VegaLiteTimeline ({ data, isDark, preset }: ChartProps<TimelineEvent[]>): JSX.Element {
  // Vega-Lite adds ids to the rows it gets, so they're copied; the tooltip fields are precomputed
  const values = data.map(d => ({ ...d, kindLabel: getKindLabel(d.kind), range: formatRange(d) }))
  // A ranged bar's `x2` shares the scale with `x`: with a `domain`, Vega-Lite warns about two conflicting domains
  const x = { type: 'temporal', title: null, scale: { domainMin: WEEK_START, domainMax: WEEK_END }, axis: { formatType: 'formatDay', tickCount: 'day' } } as const
  const y = { field: 'service', type: 'nominal', sort: services, title: null } as const
  const color = { field: 'kindLabel', type: 'nominal', sort: kinds.map(k => k.label), title: null } as const
  // Custom point shapes are SVG paths in a -1…1 square, and `size` is the area in square pixels
  const icon = (kind: 'deployment' | 'incident', path: string, field: 'start' | 'end'): Layer => ({
    transform: [{ filter: `datum.kind === '${kind}'` }],
    mark: { type: 'point' as const, shape: path, filled: true, opacity: 1, size: ICON_SIZE * ICON_SIZE, xOffset: (field === 'end' ? 1 : -1) * ICON_SIZE / 2 },
    encoding: { x: { ...x, field }, y, color, opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 } },
  })

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    config: { customFormatTypes: true },
    data: { values },
    layer: [
      {
        // A ranged bar: `x` is the start and `x2` the end
        mark: { type: 'bar', cornerRadius: preset === 'rounded' ? 999 : undefined },
        // Clicking a legend item highlights that kind and fades the others; shift-click adds or removes one
        params: [{ name: 'highlight', select: { type: 'point', fields: ['kindLabel'] }, bind: 'legend' }],
        encoding: {
          x: { ...x, field: 'start' },
          x2: { field: 'end' },
          y,
          color,
          opacity: { condition: { param: 'highlight', value: 1 }, value: 0.2 },
          tooltip: [{ field: 'title', title: 'Event' }, { field: 'service', title: 'Service' }, { field: 'kindLabel', title: 'Kind' }, { field: 'range', title: 'Time' }],
        },
      },
      ...(preset === 'icons' ? [icon('deployment', DEPLOYMENT_ICON_PATH, 'end'), icon('incident', INCIDENT_ICON_PATH, 'start')] : []),
    ],
  }

  const options: EmbedOptions = { actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' }, expressionFunctions }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
