import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

export default function EChartsGroupedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const horizontal = preset === 'horizontal'
  const trimLabels = preset === 'trim-labels'
  // echarts-for-react merges each option into the previous one, so the preset options are set in every state
  const categoryAxis = {
    type: 'category',
    data: data.map(d => d.region),
    // `truncate` needs a fixed label width; `interval: 0` keeps every label, the default hides the ones that would overlap
    axisLabel: { width: trimLabels ? 70 : undefined, overflow: trimLabels ? 'truncate' : 'none', interval: trimLabels ? 0 : 'auto' },
  }
  const valueAxis = { type: 'value', axisLabel: { formatter: formatValue } }

  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        // Decals are ECharts' patterns, part of its accessibility options
        aria: { enabled: preset === 'patterns', decal: { show: preset === 'patterns' } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: formatValue },
        legend: {},
        // Horizontal bars swap the axes; `inverse` lists the regions top to bottom
        xAxis: horizontal ? valueAxis : categoryAxis,
        yAxis: horizontal ? { ...categoryAxis, inverse: true } : valueAxis,
        series: series.map(s => ({ type: 'bar', name: s.label, data: data.map(d => d[s.key]) })),
      }}
    />
  )
}
