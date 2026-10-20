import React from 'react'
import { mean } from 'd3-array'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'

import type { ChartProps } from '../types'
import { DataRecord, species, formatMass } from './data'

ModuleRegistry.registerModules([AllCommunityModule])

const shapes = ['circle', 'triangle', 'square'] as const

export default function AgChartsScatterPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const averageFlipper = mean(data, d => d.flipperLength)
  const averageBill = mean(data, d => d.billLength)
  const isAverages = preset === 'averages'

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
          // A bubble's label shows its size value. Labels that collide are hidden by default; `wrapping` and `truncate` stop the
          // ones that stay from being wrapped or cut short
          ...preset === 'labels' && { label: { enabled: true, placement: 'bottom', wrapping: 'never', truncate: false, formatter: ({ value }) => formatMass(value) } },
          ...preset === 'rings' && { fillOpacity: 0, strokeWidth: 1.5 },
        })),
        axes: {
          x: {
            type: 'number',
            title: { text: 'Flipper length (mm)' },
            ...isAverages && { crossLines: [{ type: 'line', value: averageFlipper, lineDash: [6, 4], label: { text: `Average ${averageFlipper.toFixed(0)} mm`, position: 'inside-top-right' } }] },
          },
          y: {
            type: 'number',
            title: { text: 'Bill length (mm)' },
            ...isAverages && { crossLines: [{ type: 'line', value: averageBill, lineDash: [6, 4], label: { text: `Average ${averageBill.toFixed(1)} mm`, position: 'inside-top-left' } }] },
          },
        },
      }}
    />
  )
}
