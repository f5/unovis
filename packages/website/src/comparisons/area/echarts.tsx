import React from 'react'
import ReactECharts from 'echarts-for-react'

import { DataRecord, series, formatMonth, formatValue } from './data'

export default function EChartsAreaChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', valueFormatter: formatValue },
        legend: {},
        xAxis: { type: 'category', boundaryGap: false, data: data.map(d => formatMonth(d.date)) },
        yAxis: { type: 'value', axisLabel: { formatter: formatValue } },
        series: series.map(s => ({
          type: 'line',
          name: s.label,
          stack: 'spend',
          areaStyle: {},
          showSymbol: false,
          data: data.map(d => d[s.key]),
        })),
      }}
    />
  )
}
