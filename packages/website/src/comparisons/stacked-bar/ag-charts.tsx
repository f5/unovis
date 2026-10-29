import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'
import type { AgPatternName } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, series, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

const patterns: AgPatternName[] = ['forward-slanted-lines', 'circles', 'crosses', 'backward-slanted-lines']
const CAPACITY = 400

export default function AgChartsStackedBarChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        series: series.map((s, i) => ({
          type: 'bar',
          xKey: 'month',
          yKey: s.key,
          yName: s.label,
          stacked: true,
          direction: preset === 'horizontal' ? 'horizontal' : 'vertical',
          ...(preset === 'patterns' && { fill: { type: 'pattern', pattern: patterns[i] } }),
        })),
        ...(preset === 'capacity' && {
          axes: {
            x: { type: 'category' },
            y: { type: 'number', crossLines: [{ type: 'line', value: CAPACITY, lineDash: [6, 4], label: { text: `Capacity ${formatValue(CAPACITY)}`, position: 'top-right' } }] },
          },
        }),
        tooltip: { mode: 'shared' },
        formatter: { y: ({ value }) => formatValue(value as number) },
      }}
    />
  )
}
