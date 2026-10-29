import React from 'react'
import { ResponsiveLine } from '@nivo/line'
import { patternDotsDef, patternLinesDef, patternSquaresDef } from '@nivo/core'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoAreaChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const areas = series.map(s => ({
    id: s.label,
    data: data.map(d => ({ x: d.date, y: d[s.key] })),
  }))

  // Patterns are SVG defs matched to the series by id; `inherit` takes the series color
  const stroke = isDark ? '#222' : '#fff'
  const patterns = [
    patternLinesDef('stripes', { background: 'inherit', color: stroke, rotation: -45, lineWidth: 2, spacing: 6 }),
    patternDotsDef('dots', { background: 'inherit', color: stroke, size: 3, padding: 3 }),
    patternLinesDef('stripes-reversed', { background: 'inherit', color: stroke, rotation: 45, lineWidth: 2, spacing: 6 }),
    patternSquaresDef('squares', { background: 'inherit', color: stroke, size: 3, padding: 3 }),
  ]

  return (
    <ResponsiveLine
      data={areas}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 30, right: 10, bottom: 25, left: 50 }}
      xScale={{ type: 'time', useUTC: false }}
      yScale={{ type: 'linear', stacked: true }}
      yFormat={formatValue}
      axisBottom={{ format: formatMonth, tickValues: 'every 4 months' }}
      axisLeft={{ format: formatValue }}
      curve={preset === 'step' ? 'step' : undefined}
      enableArea
      // At the default 20% area opacity the overlapping areas wash the patterns out
      areaOpacity={preset === 'patterns' ? 1 : undefined}
      defs={preset === 'patterns' ? patterns : undefined}
      fill={preset === 'patterns' ? series.map((s, i) => ({ match: { id: s.label }, id: patterns[i].id })) : undefined}
      enablePoints={false}
      enableSlices="x"
      legends={[{ anchor: 'top-left', direction: 'row', translateY: -30, itemWidth: 80, itemHeight: 20, toggleSerie: true }]}
    />
  )
}
