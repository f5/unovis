import React from 'react'
import ReactECharts from 'echarts-for-react'

import { DataRecord, species, formatMass } from './data'

// `symbolSize` takes pixels, so we scale the body mass ourselves (a `visualMap` could map it instead)
const symbolSize = (value: number[]): number => 4 + (value[2] - 2700) / 225
const symbols = ['circle', 'triangle', 'rect']

export default function EChartsScatterPlot ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: {
          formatter: ({ seriesName, value }: { seriesName: string; value: number[] }) => `
            <b>${seriesName}</b><br/>
            Flipper: ${value[0]} mm<br/>
            Bill: ${value[1]} mm<br/>
            Body mass: ${formatMass(value[2])}
          `,
        },
        legend: {},
        xAxis: { type: 'value', scale: true, name: 'Flipper length (mm)', nameLocation: 'middle', nameGap: 25 },
        yAxis: { type: 'value', scale: true, name: 'Bill length (mm)', nameLocation: 'middle', nameGap: 30 },
        series: species.map((name, i) => ({
          type: 'scatter',
          name,
          symbol: symbols[i],
          symbolSize,
          data: data.filter(d => d.species === name).map(d => [d.flipperLength, d.billLength, d.bodyMass]),
        })),
      }}
    />
  )
}
