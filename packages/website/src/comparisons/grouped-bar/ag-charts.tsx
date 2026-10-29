import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule, AgPatternName } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

const patterns: AgPatternName[] = ['forward-slanted-lines', 'circles', 'crosses']

export default function AgChartsGroupedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        series: series.map((s, i) => ({
          type: 'bar',
          xKey: 'region',
          yKey: s.key,
          yName: s.label,
          direction: preset === 'horizontal' ? 'horizontal' : 'vertical',
          // The pattern is drawn in the series color
          fill: preset === 'patterns' ? { type: 'pattern', pattern: patterns[i] } : undefined,
        })),
        // The category axis wraps long labels by default; `truncate` cuts them to the band's width with an ellipsis instead
        axes: preset === 'trim-labels' ? { x: { type: 'category', label: { wrapping: 'never', truncate: true } } } : undefined,
        tooltip: { mode: 'shared' },
        formatter: { y: ({ value }) => formatValue(value as number) },
      }}
    />
  )
}
