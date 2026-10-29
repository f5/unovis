import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, series, formatMonth, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

const TARGET = 50

export default function AgChartsLineChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // The months the iOS app reported no data, for the "Annotations" preset
  const outage = data.filter(d => d.ios === undefined)

  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        // Missing months leave gaps. `connectMissingData` would bridge them, but only with the same solid line
        series: series.map(s => ({
          type: 'line',
          xKey: 'date',
          yKey: s.key,
          yName: s.label,
          marker: { enabled: false },
          interpolation: preset === 'step' ? { type: 'step', position: 'middle' } : undefined,
          lineDash: preset === 'dashed' && s.key === 'ios' ? [6, 4] : undefined,
        })),
        axes: {
          x: {
            type: 'time',
            crossLines: preset === 'annotations' && outage.length > 0
              ? [{ type: 'range', range: [outage[0].date, outage[outage.length - 1].date], label: { text: 'iOS outage', position: 'inside-top-left' } }]
              : undefined,
          },
          y: {
            type: 'number',
            crossLines: preset === 'annotations'
              ? [{ type: 'line', value: TARGET, lineDash: [6, 4], label: { text: `Target ${formatValue(TARGET)}`, position: 'top-right' } }]
              : undefined,
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
