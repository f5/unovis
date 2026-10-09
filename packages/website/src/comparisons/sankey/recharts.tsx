import React from 'react'
import { Sankey, Tooltip, Layer, Rectangle } from 'recharts'
import type { SankeyNodeProps } from 'recharts'

import { SankeyData, formatVisits } from './data'

export default function RechartsSankey ({ data, isDark }: { data: SankeyData; isDark: boolean }): JSX.Element {
  // Recharts links nodes by their index in the nodes array
  const index = new Map(data.nodes.map((n, i) => [n.id, i]))
  const sankeyData = {
    nodes: data.nodes.map(n => ({ name: n.label })),
    links: data.links.map(l => ({ source: index.get(l.source), target: index.get(l.target), value: l.value })),
  }

  // Nodes have no labels by default, so we render them ourselves like the Recharts docs do
  const renderNode = ({ x, y, width, height, payload }: SankeyNodeProps): JSX.Element => {
    // In Recharts, `targetLinks` are the outgoing links
    const isLast = payload.targetLinks.length === 0
    return (
      <Layer>
        <Rectangle x={x} y={y} width={width} height={height} fill="#5192ca"/>
        <text x={isLast ? x - 6 : x + width + 6} y={y + height / 2} textAnchor={isLast ? 'end' : 'start'} dominantBaseline="middle"
          fontSize={12} fill={isDark ? '#ccc' : '#333'}>
          {payload.name}
        </text>
      </Layer>
    )
  }

  return (
    <Sankey
      width="100%"
      height="100%"
      data={sankeyData}
      node={renderNode}
      nodePadding={12}
      link={{ stroke: isDark ? '#555' : '#ccc' }}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <Tooltip formatter={formatVisits} contentStyle={isDark ? { background: '#222', borderColor: '#444' } : undefined}/>
    </Sankey>
  )
}
