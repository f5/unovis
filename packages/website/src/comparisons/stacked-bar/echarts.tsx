import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

const CAPACITY = 400

export default function EChartsStackedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const isHorizontal = preset === 'horizontal'
  // The category axis lists its first item at the bottom when it's vertical, `inverse` puts January on top
  const monthAxis = { type: 'category', data: data.map(d => d.month), inverse: isHorizontal }
  const valueAxis = { type: 'value', axisLabel: { formatter: formatValue } }
  // A mark line belongs to a series: this one is on Low, so hiding Low hides the line too
  const markLine = preset === 'capacity'
    ? { symbol: 'none', silent: true, lineStyle: { type: 'dashed' }, label: { position: 'insideEndTop', formatter: `Capacity ${formatValue(CAPACITY)}` }, data: [{ yAxis: CAPACITY }] }
    : undefined

  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      notMerge
      option={{
        backgroundColor: 'transparent',
        // Decals are ECharts' fill patterns: with `show`, every series gets its own
        aria: { enabled: preset === 'patterns', decal: { show: preset === 'patterns' } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: formatValue },
        legend: {},
        xAxis: isHorizontal ? valueAxis : monthAxis,
        yAxis: isHorizontal ? monthAxis : valueAxis,
        series: series.map((s, i) => ({ type: 'bar', name: s.label, stack: 'tickets', data: data.map(d => d[s.key]), markLine: i === 0 ? markLine : undefined })),
      }}
    />
  )
}
