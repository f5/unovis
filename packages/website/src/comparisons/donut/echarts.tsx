import React from 'react'
import ReactECharts from 'echarts-for-react'

import { DataRecord, formatValue, getTotal } from './data'

export default function EChartsDonutChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', valueFormatter: formatValue },
        legend: {},
        title: { text: formatValue(getTotal(data)), subtext: 'Total sessions', left: 'center', top: '42%' },
        series: [{
          type: 'pie',
          radius: ['45%', '65%'],
          label: { show: false },
          data: data.map(d => ({ name: d.source, value: d.sessions })),
        }],
      }}
    />
  )
}
