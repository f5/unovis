import React from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { patternDotsDef, patternLinesDef, patternSquaresDef } from '@nivo/core'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

// `inherit` paints the pattern's background with the bar's own color
const patternDefs = [
  patternLinesDef('lines', { background: 'inherit', color: 'rgba(255, 255, 255, 0.6)', rotation: -45, lineWidth: 3, spacing: 7 }),
  patternDotsDef('dots', { background: 'inherit', color: 'rgba(255, 255, 255, 0.6)', size: 3, padding: 3, stagger: true }),
  patternSquaresDef('squares', { background: 'inherit', color: 'rgba(255, 255, 255, 0.6)', size: 3, padding: 3 }),
]

export default function NivoGroupedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Nivo uses the data keys as series names
  const bars = data.map(d => ({ region: d.region, ...Object.fromEntries(series.map(s => [s.label, d[s.key]])) }))
  const horizontal = preset === 'horizontal'
  // `truncateTickAt` cuts a label after a number of characters, not at a width
  const regionAxis = { truncateTickAt: preset === 'trim-labels' ? 14 : undefined }
  const valueAxis = { format: formatValue }

  return (
    <ResponsiveBar
      // The horizontal layout lists the first row at the bottom, so the rows are reversed to read top to bottom
      data={horizontal ? bars.slice().reverse() : bars}
      keys={series.map(s => s.label)}
      indexBy="region"
      groupMode="grouped"
      layout={horizontal ? 'horizontal' : 'vertical'}
      theme={isDark ? darkTheme : undefined}
      // Nivo doesn't measure the labels, so the left margin is set by hand to fit the region names
      margin={{ top: 30, right: horizontal ? 25 : 10, bottom: 25, left: horizontal ? 125 : 50 }}
      padding={0.2}
      valueFormat={formatValue}
      axisLeft={horizontal ? regionAxis : valueAxis}
      axisBottom={horizontal ? valueAxis : regionAxis}
      enableGridX={horizontal}
      enableGridY={!horizontal}
      enableLabel={false}
      defs={preset === 'patterns' ? patternDefs : []}
      fill={preset === 'patterns' ? series.map((s, i) => ({ match: { id: s.label }, id: patternDefs[i].id })) : []}
      legends={[{ dataFrom: 'keys', anchor: 'top-left', direction: 'row', translateY: -30, itemWidth: 60, itemHeight: 20, toggleSerie: true }]}
    />
  )
}
