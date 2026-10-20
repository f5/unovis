import React from 'react'
import ReactECharts from 'echarts-for-react'
import { mean } from 'd3-array'

import type { ChartProps } from '../types'
import { DataRecord, species, formatMass } from './data'

// `symbolSize` takes pixels, so we scale the body mass ourselves (a `visualMap` could map it instead)
const symbolSize = (value: number[]): number => 4 + (value[2] - 2700) / 225
const symbols = ['circle', 'triangle', 'rect']
// A transparent fill replaces the series color and the border has no palette color of its own, so the rings take ECharts' palette by hand
const ringColors = ['#5070dd', '#b6d634', '#505372']

export default function EChartsScatterPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const isRings = preset === 'rings'
  const averageFlipper = mean(data, d => d.flipperLength)
  const averageBill = mean(data, d => d.billLength)

  // ECharts merges every update into the previous options, so each preset option is set (or unset) on every render
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
        legend: { data: species },
        xAxis: { type: 'value', scale: true, name: 'Flipper length (mm)', nameLocation: 'middle', nameGap: 25 },
        yAxis: { type: 'value', scale: true, name: 'Bill length (mm)', nameLocation: 'middle', nameGap: 30 },
        series: [
          ...species.map((name, i) => ({
            type: 'scatter',
            name,
            symbol: symbols[i],
            symbolSize,
            data: data.filter(d => d.species === name).map(d => [d.flipperLength, d.billLength, d.bodyMass]),
            label: { show: preset === 'labels', position: 'bottom', formatter: ({ value }: { value: number[] }) => formatMass(value[2]) },
            labelLayout: { hideOverlap: preset === 'labels' },
            itemStyle: {
              color: isRings ? 'transparent' : undefined,
              borderColor: isRings ? ringColors[i] : undefined,
              borderWidth: isRings ? 1.5 : undefined,
            },
          })),
          // The mark lines get a series of their own, so hiding a species in the legend doesn't hide them
          {
            type: 'scatter',
            name: 'Averages',
            data: [],
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: { type: 'dashed' },
              data: preset === 'averages'
                ? [
                  { xAxis: averageFlipper, label: { formatter: `Average ${averageFlipper.toFixed(0)} mm` } },
                  { yAxis: averageBill, label: { formatter: `Average ${averageBill.toFixed(1)} mm`, position: 'insideStartTop' } },
                ]
                : [],
            },
          },
        ],
      }}
    />
  )
}
