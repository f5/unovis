import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'

import { DataRecord, formatValue, getTotal } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

export default function AgChartsDonutChart ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
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
        }],
        formatter: { angle: ({ value }) => formatValue(value as number) },
      }}
    />
  )
}
