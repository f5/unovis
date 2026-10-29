import React from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'

import type { ChartProps } from '../types'
import { DataRecord, days, hours, rateDomain, formatRate, formatHour } from './data'
import { GREENS, GREENS_DARK, ORANGES } from './constants'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoHeatmap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const colors = preset === 'buckets' ? ORANGES : isDark ? GREENS_DARK : GREENS
  const rate = new Map(data.map(d => [`${d.day} ${d.hour}`, d.errorRate]))
  // Nivo takes one series per row, with a cell per column
  const rows = preset === 'transposed'
    ? hours.map(hour => ({ id: formatHour(hour), data: days.map(day => ({ x: day, y: rate.get(`${day} ${hour}`) })) }))
    : days.map(day => ({ id: day, data: hours.map(hour => ({ x: formatHour(hour), y: rate.get(`${day} ${hour}`) })) }))
  const isRounded = preset === 'rounded'

  return (
    <ResponsiveHeatMap
      data={rows}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 25, right: 10, bottom: 55, left: 40 }}
      valueFormat={formatRate}
      colors={{ type: 'quantize', domain: rateDomain, colors }}
      // Nivo paints cells without a value black by default
      emptyColor="transparent"
      // Cell labels are on by default
      enableLabels={false}
      xInnerPadding={isRounded ? 0.15 : 0}
      yInnerPadding={isRounded ? 0.15 : 0}
      borderRadius={isRounded ? 6 : 0}
      legends={[{ anchor: 'bottom', translateY: 30, length: 240, thickness: 10, direction: 'row', tickFormat: formatRate }]}
    />
  )
}
