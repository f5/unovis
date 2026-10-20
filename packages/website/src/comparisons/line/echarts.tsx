import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

const TARGET = 50

export default function EChartsLineChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // The months the iOS app reported no data, for the "Annotations" preset
  const outage = data.filter(d => d.ios === undefined)
  const annotations = preset === 'annotations'

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
        series: series.map(s => ({
          type: 'line',
          name: s.label,
          data: data.map(d => d[s.key] ?? null),
          showSymbol: false,
          step: preset === 'step' ? 'middle' : false,
          lineStyle: { type: preset === 'dashed' && s.key === 'ios' ? [6, 4] : 'solid' },
          // Marks belong to a series and hide with it, so these are on iOS. ECharts merges every new option into the
          // last one: the marks are switched off with empty data, leaving them out would keep the old ones
          ...(s.key === 'ios' && {
            markArea: {
              itemStyle: { color: 'rgba(128, 128, 128, 0.2)' },
              data: annotations && outage.length > 0 ? [[{ name: 'iOS outage', xAxis: formatMonth(outage[0].date) }, { xAxis: formatMonth(outage[outage.length - 1].date) }]] : [],
            },
            markLine: {
              symbol: 'none',
              lineStyle: { color: 'gray' },
              label: { position: 'insideEndTop', formatter: `Target ${formatValue(TARGET)}` },
              data: annotations ? [{ yAxis: TARGET }] : [],
            },
          }),
        })),
      }}
    />
  )
}
