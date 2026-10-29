import React from 'react'
import { Treemap, Tooltip } from 'recharts'

import type { ChartProps } from '../types'
import { DataRecord, teams, formatCost } from './data'

export default function RechartsTreemap ({ data, isDark }: ChartProps<DataRecord[]>): JSX.Element {
  // Recharts takes a tree: each team is a node with its services as `children`
  const tree = teams.map(team => ({
    name: team,
    children: data.filter(d => d.team === team).map(d => ({ name: d.service, cost: d.cost })),
  }))

  return (
    <Treemap data={tree} dataKey="cost" nameKey="name" style={{ height: '100%' }}>
      <Tooltip formatter={formatCost} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
    </Treemap>
  )
}
