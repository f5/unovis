import React from 'react'
import { ResponsiveTreeMap } from '@nivo/treemap'

import type { ChartProps } from '../types'
import { DataRecord, teams, formatCost } from './data'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

export default function NivoTreemap ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // Nivo takes a tree with a root node: each team is a node with its services as `children`
  const tree = {
    id: 'Cloud spend',
    children: teams.map(team => ({
      id: team,
      children: data.filter(d => d.team === team).map(d => ({ id: d.service, cost: d.cost })),
    })),
  }

  return (
    <ResponsiveTreeMap
      data={tree}
      identity="id"
      value="cost"
      valueFormat={formatCost}
      theme={isDark ? darkTheme : undefined}
      label={node => `${node.id}: ${node.formattedValue}`}
      // Parent labels are on by default; the default chart turns them off like the other libraries
      enableParentLabel={preset === 'groups'}
    />
  )
}
