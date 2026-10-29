import React from 'react'
import { ResponsiveLine } from '@nivo/line'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoLineChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const lines = series.map(s => ({
    id: s.label,
    // Missing months leave gaps. Nivo has no option to bridge them
    data: data.map(d => ({ x: d.date, y: d[s.key] ?? null })),
  }))

  return (
    <ResponsiveLine
      data={lines}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 30, right: 10, bottom: 25, left: 45 }}
      xScale={{ type: 'time', useUTC: false }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
      yFormat={formatValue}
      curve={preset === 'step' ? 'step' : 'linear'}
      axisBottom={{ format: formatMonth, tickValues: 'every 6 months' }}
      axisLeft={{ format: formatValue }}
      enablePoints={false}
      enableSlices="x"
      legends={[{ anchor: 'top-left', direction: 'row', translateY: -30, itemWidth: 70, itemHeight: 20, toggleSerie: true }]}
    />
  )
}
