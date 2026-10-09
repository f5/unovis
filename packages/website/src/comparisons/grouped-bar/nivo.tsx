import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

import { DataRecord, series, formatValue } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoGroupedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  // Nivo uses the data keys as series names
  const bars = data.map(d => ({ region: d.region, ...Object.fromEntries(series.map(s => [s.label, d[s.key]])) }))

  return (
    <ResponsiveBar
      data={bars}
      keys={series.map(s => s.label)}
      indexBy="region"
      groupMode="grouped"
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 30, right: 10, bottom: 25, left: 50 }}
      padding={0.2}
      valueFormat={formatValue}
      axisLeft={{ format: formatValue }}
      enableLabel={false}
      legends={[{ dataFrom: 'keys', anchor: 'top-left', direction: 'row', translateY: -30, itemWidth: 60, itemHeight: 20, toggleSerie: true }]}
    />
  )
}
