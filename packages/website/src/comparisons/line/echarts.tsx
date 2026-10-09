import React from 'react'
import ReactECharts from 'echarts-for-react'

import { DataRecord, series, formatMonth, formatValue } from './data'

export default function EChartsLineChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', valueFormatter: value => value === undefined ? '-' : formatValue(+value) },
        legend: {},
        xAxis: { type: 'category', data: data.map(d => formatMonth(d.date)) },
        yAxis: { type: 'value', axisLabel: { formatter: formatValue } },
        // Missing months leave gaps. `connectNulls` would bridge them, but only with the same solid line
        series: series.map(s => ({ type: 'line', name: s.label, data: data.map(d => d[s.key] ?? null), showSymbol: false })),
      }}
    />
  )
}
