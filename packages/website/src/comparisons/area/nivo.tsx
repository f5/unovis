import React from 'react'
import { ResponsiveLine } from '@nivo/line'

import { DataRecord, series, formatMonth, formatValue } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoAreaChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const areas = series.map(s => ({
    id: s.label,
    data: data.map(d => ({ x: d.date, y: d[s.key] })),
  }))

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
      enableArea
      enablePoints={false}
      enableSlices="x"
      legends={[{ anchor: 'top-left', direction: 'row', translateY: -30, itemWidth: 80, itemHeight: 20, toggleSerie: true }]}
    />
  )
}
