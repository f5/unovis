import React from 'react'
import { SunburstChart, SunburstData, Tooltip } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

// Recharts doesn't have a default color palette, these colors are from its docs. Children inherit their parent's fill
const colors = ['#8884d8', '#82ca9d', '#ffc658']

// SunburstChart takes a tree in which every node, the root too, has its own value. It keys the sectors by `name` and
// their index among their siblings, and browser names repeat, so `name` is the node's path and `label` its display name
function toTree (name: string, label: string, rows: DataRecord[], levels: ((d: DataRecord) => string)[]): SunburstData {
  const value = rows.reduce((sum, d) => sum + d.sessions, 0)
  if (!levels.length) return { name, label, value }
  const [level, ...rest] = levels
  const labels = [...new Set(rows.map(level))]
  return { name, label, value, children: labels.map(l => toTree(`${name}/${l}`, l, rows.filter(d => level(d) === l), rest)) }
}

export default function RechartsNestedDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const tree = toTree('Sessions', 'Sessions', data, [d => d.platform, d => d.os, d => d.browser])
  tree.children?.forEach((d, i) => { d.fill = colors[i % colors.length] })

  return (
    <SunburstChart
      data={tree}
      dataKey="value"
      nameKey="label"
      responsive
      style={{ height: '100%' }}
      // Degrees, counterclockwise from 3 o'clock
      startAngle={0}
      endAngle={preset === 'half' ? 180 : 360}
    >
      <Tooltip formatter={formatValue} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
    </SunburstChart>
  )
}
