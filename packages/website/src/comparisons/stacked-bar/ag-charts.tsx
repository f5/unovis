import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'

import { DataRecord, series, formatValue } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

export default function AgChartsStackedBarChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        data,
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        series: series.map(s => ({ type: 'bar', xKey: 'month', yKey: s.key, yName: s.label, stacked: true })),
        tooltip: { mode: 'shared' },
        formatter: { y: ({ value }) => formatValue(value as number) },
      }}
    />
  )
}
