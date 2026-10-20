import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

const CAPACITY = 400

// Nivo's patterns are SVG defs: `background: 'inherit'` keeps the series color under the pattern
const patternColor = 'rgba(255, 255, 255, 0.45)'
const patternDefs = [
  { id: 'lines', type: 'patternLines', background: 'inherit', color: patternColor, rotation: -45, lineWidth: 2, spacing: 6 },
  { id: 'dots', type: 'patternDots', background: 'inherit', color: patternColor, size: 3, padding: 2, stagger: true },
  { id: 'squares', type: 'patternSquares', background: 'inherit', color: patternColor, size: 3, padding: 2 },
  { id: 'reverse-lines', type: 'patternLines', background: 'inherit', color: patternColor, rotation: 45, lineWidth: 2, spacing: 6 },
]

export default function NivoStackedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Nivo uses the data keys as series names
  const bars = data.map(d => ({ month: d.month, ...Object.fromEntries(series.map(s => [s.label, d[s.key]])) }))
  const isHorizontal = preset === 'horizontal'
  const textColor = isDark ? '#ccc' : '#333'

  return (
    <ResponsiveBar
      data={bars}
      keys={series.map(s => s.label)}
      indexBy="month"
      // Horizontal bars list the months bottom-up: Nivo's band scale has no `reverse` option
      layout={isHorizontal ? 'horizontal' : 'vertical'}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 30, right: 10, bottom: 25, left: 45 }}
      padding={0.2}
      valueFormat={formatValue}
      axisLeft={isHorizontal ? {} : { format: formatValue }}
      axisBottom={isHorizontal ? { format: formatValue } : {}}
      enableGridX={isHorizontal}
      enableGridY={!isHorizontal}
      enableLabel={false}
      defs={preset === 'patterns' ? patternDefs : []}
      fill={preset === 'patterns' ? series.map((s, i) => ({ match: { id: s.label }, id: patternDefs[i].id })) : []}
      markers={preset === 'capacity'
        ? [{
          axis: 'y',
          value: CAPACITY,
          legend: `Capacity ${formatValue(CAPACITY)}`,
          lineStyle: { stroke: textColor, strokeWidth: 1, strokeDasharray: '6 4' },
          textStyle: { fill: textColor, fontSize: 11 },
        }]
        : []}
      legends={[{ dataFrom: 'keys', anchor: 'top-left', direction: 'row', translateY: -30, itemWidth: 70, itemHeight: 20, toggleSerie: true }]}
    />
  )
}
