import React from 'react'
import ReactECharts from 'echarts-for-react'

import { DataRecord, series, formatValue } from './data'

export default function EChartsStackedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: formatValue },
        legend: {},
        xAxis: { type: 'category', data: data.map(d => d.month) },
        yAxis: { type: 'value', axisLabel: { formatter: formatValue } },
        series: series.map(s => ({ type: 'bar', name: s.label, stack: 'tickets', data: data.map(d => d[s.key]) })),
      }}
    />
  )
}
