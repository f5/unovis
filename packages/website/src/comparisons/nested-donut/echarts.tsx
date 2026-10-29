import React from 'react'
import ReactECharts from 'echarts-for-react'

import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

type Node = { name: string; value?: number; children?: Node[] }

// The sunburst series takes a tree: the leaves have values, and ECharts adds them up for the parents
function toTree (rows: DataRecord[], levels: ((d: DataRecord) => string)[]): Node[] {
  const [level, ...rest] = levels
  const names = [...new Set(rows.map(level))]
  return names.map(name => {
    const children = rows.filter(d => level(d) === name)
    return rest.length ? { name, children: toTree(children, rest) } : { name, value: children[0].sessions }
  })
}

export default function EChartsNestedDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // `levels[0]` styles the root, which is only drawn after drilling down; then come the platform, OS and browser rings.
  // The rings span the series' `radius`, 0 to 75% by default, in equal widths unless a level has its own radius
  const levels = preset === 'inwards'
    ? [{}, { radius: ['50%', '75%'] }, { radius: ['25%', '50%'] }, { radius: [0, '25%'] }]
    : preset === 'widths'
      ? [{}, { radius: [0, '14%'] }, { radius: ['14%', '34%'] }, { radius: ['34%', '75%'] }]
      : []

  // echarts-for-react merges each option into the previous one, so the preset options are set in every state
  return (
    <ReactECharts
      theme={isDark ? 'dark' : undefined}
      style={{ height: '100%' }}
      option={{
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', valueFormatter: formatValue },
        series: [{
          type: 'sunburst',
          // ECharts sorts siblings by value by default; `null` keeps the data order of the other charts
          sort: null,
          levels,
          data: toTree(data, [d => d.platform, d => d.os, d => d.browser]),
        }],
      }}
    />
  )
}
