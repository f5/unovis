import React from 'react'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import { DataRecord, species } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

// Nivo's scatter plot draws circles only; other shapes need a custom `nodeComponent`
export default function NivoScatterPlot ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  const groups = species.map(name => ({
    id: name,
    data: data.filter(d => d.species === name).map(d => ({ x: d.flipperLength, y: d.billLength, mass: d.bodyMass })),
  }))

  return (
    <ResponsiveScatterPlot
      data={groups}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 30, right: 10, bottom: 40, left: 50 }}
      xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
      nodeSize={{ key: 'data.mass', values: [2700, 6300], sizes: [4, 16] }}
      axisBottom={{ legend: 'Flipper length (mm)', legendPosition: 'middle', legendOffset: 32 }}
      axisLeft={{ legend: 'Bill length (mm)', legendPosition: 'middle', legendOffset: -38 }}
      legends={[{ anchor: 'top-left', direction: 'row', translateY: -30, itemWidth: 80, itemHeight: 20 }]}
    />
  )
}
