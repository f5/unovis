import React from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions } from 'vega-embed'

import type { ChartProps } from '../types'
import { DataRecord, days, hours, rateDomain, formatHour, formatCell } from './data'
import { GREENS, GREENS_DARK, ORANGES } from './constants'

export default function VegaLiteHeatmap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const isRounded = preset === 'rounded'
  // Tooltips take a d3-format string rather than a function, so the labels are formatted before they get to the spec
  const values = data.map(d => ({ ...d, hourLabel: formatHour(d.hour), label: formatCell(d) }))
  // Ordinal fields are sorted alphabetically by default, the lists keep the days and hours in order. The band scales of
  // rect marks have no padding by default
  const scale = isRounded ? { paddingInner: 0.15 } : undefined
  const hour = { field: 'hourLabel', type: 'ordinal', sort: hours.map(formatHour), title: null, scale } as const
  const day = { field: 'day', type: 'ordinal', sort: days, title: null, scale } as const
  const isTransposed = preset === 'transposed'
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    width: 'container',
    height: 'container',
    // The dark theme paints its own background
    background: 'transparent',
    data: { values },
    mark: { type: 'rect', cornerRadius: isRounded ? 6 : undefined },
    encoding: {
      x: isTransposed ? day : hour,
      y: isTransposed ? hour : day,
      color: {
        field: 'errorRate',
        type: 'quantitative',
        scale: { type: 'quantize', domain: rateDomain, range: preset === 'buckets' ? ORANGES : isDark ? GREENS_DARK : GREENS },
        // On the right, the legend would take a quarter of the card's width
        legend: { title: null, orient: 'top', labelExpr: 'datum.label ? datum.label + \'%\' : \'\'' },
      },
      tooltip: { field: 'label' },
    },
  }

  const options: EmbedOptions = {
    actions: false,
    theme: isDark ? 'dark' : undefined,
    tooltip: { theme: isDark ? 'dark' : 'light' },
  }

  return <VegaEmbed spec={spec} options={options} style={{ height: '100%' }}/>
}
