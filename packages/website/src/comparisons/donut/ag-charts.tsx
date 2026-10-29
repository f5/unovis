import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule, AgPatternName } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, sources, formatValue, getTotal } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

// AG Charts' stock patterns, one per traffic source
const patterns: AgPatternName[] = ['forward-slanted-lines', 'circles', 'vertical-lines', 'squares', 'horizontal-lines', 'diamonds']

export default function AgChartsDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        series: [{
          type: 'donut',
          angleKey: 'sessions',
          legendItemKey: 'source',
          innerRadiusRatio: 0.6,
          innerLabels: [
            { text: formatValue(getTotal(data)), fontSize: 18, fontWeight: 'bold' },
            { text: 'Total sessions' },
          ],
          sectorSpacing: preset === 'rounded' ? 4 : 0,
          cornerRadius: preset === 'rounded' ? 6 : 0,
          // The styler receives the theme's fill of each sector and returns a pattern over it
          itemStyler: preset === 'patterns'
            ? ({ datum, fill }) => ({
              fill: {
                type: 'pattern',
                pattern: patterns[sources.indexOf((datum as DataRecord).source) % patterns.length],
                backgroundFill: fill as string,
                fill: 'rgba(255, 255, 255, 0.5)',
                stroke: 'rgba(255, 255, 255, 0.5)',
              },
            })
            : undefined,
        }],
        formatter: { angle: ({ value }) => formatValue(value as number) },
      }}
    />
  )
}
