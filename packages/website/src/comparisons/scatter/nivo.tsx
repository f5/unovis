import React from 'react'
import { mean } from 'd3-array'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import type { ChartProps } from '../types'
import { DataRecord, species } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  grid: { line: { stroke: '#444' } },
  tooltip: { container: { background: '#222', color: '#ccc' } },
  markers: { lineColor: '#ccc' },
}

// Nivo's scatter plot draws circles only; other shapes need a custom `nodeComponent`
export default function NivoScatterPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Marker legends don't take the theme's text style
  const markerText = { fill: isDark ? '#ccc' : '#333', fontSize: 11 }
  const averageFlipper = mean(data, d => d.flipperLength)
  const averageBill = mean(data, d => d.billLength)
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
      markers={preset === 'averages'
        ? [
          { axis: 'x', value: averageFlipper, legend: `Average ${averageFlipper.toFixed(0)} mm`, textStyle: markerText, lineStyle: { strokeDasharray: '6 4' } },
          { axis: 'y', value: averageBill, legend: `Average ${averageBill.toFixed(1)} mm`, legendPosition: 'top-left', textStyle: markerText, lineStyle: { strokeDasharray: '6 4' } },
        ]
        : []}
    />
  )
}
