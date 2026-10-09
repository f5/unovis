import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'

import { DataRecord, series, formatMonth, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

export default function AgChartsLineChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        // Missing months leave gaps. `connectMissingData` would bridge them, but only with the same solid line
        series: series.map(s => ({ type: 'line', xKey: 'date', yKey: s.key, yName: s.label, marker: { enabled: false } })),
        axes: { x: { type: 'time' }, y: { type: 'number' } },
        tooltip: { mode: 'shared' },
        formatter: {
          x: ({ value }) => formatMonth(value as Date),
          y: ({ value }) => formatValue(value as number),
        },
      }}
    />
  )
}
