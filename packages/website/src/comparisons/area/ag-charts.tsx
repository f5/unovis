import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'
import type { AgPatternName } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

const patterns: AgPatternName[] = ['forward-slanted-lines', 'circles', 'backward-slanted-lines', 'squares']
const MIGRATION = { from: new Date(2024, 6, 1), to: new Date(2024, 8, 1) }
const BUDGET = 100

export default function AgChartsAreaChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const annotated = preset === 'annotations'
  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        series: series.map((s, i) => ({
          type: 'area',
          xKey: 'date',
          yKey: s.key,
          yName: s.label,
          stacked: true,
          interpolation: preset === 'step' ? { type: 'step', position: 'middle' } : undefined,
          fill: preset === 'patterns' ? { type: 'pattern', pattern: patterns[i] } : undefined,
        })),
        axes: {
          x: {
            type: 'time',
            crossLines: annotated ? [{ type: 'range', range: [MIGRATION.from, MIGRATION.to], label: { text: 'Migration', position: 'inside-top' } }] : undefined,
          },
          y: {
            type: 'number',
            crossLines: annotated ? [{ type: 'line', value: BUDGET, stroke: 'red', lineDash: [6, 4], label: { text: `Budget ${formatValue(BUDGET)}`, position: 'inside-top-right' } }] : undefined,
          },
        },
        tooltip: { mode: 'shared' },
        formatter: {
          x: ({ value }) => formatMonth(value as Date),
          y: ({ value }) => formatValue(value as number),
        },
      }}
    />
  )
}
