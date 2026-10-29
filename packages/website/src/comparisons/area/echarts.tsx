import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

const MIGRATION = { from: new Date(2024, 6, 1), to: new Date(2024, 8, 1) }
const BUDGET = 100

export default function EChartsAreaChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const patterns = preset === 'patterns'
  const annotated = preset === 'annotations'

  // echarts-for-react merges every new option into the chart, so the presets set their options back when they're off
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        // Decal patterns are part of the accessibility options
        aria: { enabled: patterns, decal: { show: patterns } },
        tooltip: { trigger: 'axis', valueFormatter: formatValue },
        legend: {},
        xAxis: { type: 'category', boundaryGap: false, data: data.map(d => formatMonth(d.date)) },
        yAxis: { type: 'value', axisLabel: { formatter: formatValue } },
        series: series.map((s, i) => ({
          type: 'line',
          name: s.label,
          stack: 'spend',
          areaStyle: {},
          showSymbol: false,
          step: preset === 'step' ? 'middle' : false,
          data: data.map(d => d[s.key]),
          // Mark areas and lines belong to a series: they're on the bottom one, so hiding Compute hides them too
          ...(i === 0 && {
            markArea: {
              silent: true,
              data: annotated ? [[{ name: 'Migration', xAxis: formatMonth(MIGRATION.from) }, { xAxis: formatMonth(MIGRATION.to) }]] : [],
            },
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: { color: 'red', type: [6, 4] },
              label: { position: 'insideEndTop', formatter: '{b}' },
              data: annotated ? [{ name: `Budget ${formatValue(BUDGET)}`, yAxis: BUDGET }] : [],
            },
          }),
        })),
      }}
    />
  )
}
