import React from 'react'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'

import { DataRecord, species } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

const shapes = ['circle', 'triangle', 'square'] as const

export default function AgChartsScatterPlot ({ data, isDark }: { data: DataRecord[]; isDark: boolean }): JSX.Element {
  return (
    <AgCharts
      style={{ height: '100%' }}
      options={{
        theme: isDark ? 'ag-default-dark' : 'ag-default',
        background: { visible: false },
        series: species.map((name, i) => ({
          type: 'bubble',
          title: name,
          shape: shapes[i],
          data: data.filter(d => d.species === name),
          xKey: 'flipperLength',
          xName: 'Flipper length (mm)',
          yKey: 'billLength',
          yName: 'Bill length (mm)',
          sizeKey: 'bodyMass',
          sizeName: 'Body mass (g)',
        })),
        axes: {
          x: { type: 'number', title: { text: 'Flipper length (mm)' } },
          y: { type: 'number', title: { text: 'Bill length (mm)' } },
        },
      }}
    />
  )
}
