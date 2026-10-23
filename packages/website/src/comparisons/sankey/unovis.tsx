import React from 'react'
import { Position, Sankey, getCSSColorVariable } from '@unovis/ts'
import { VisSingleContainer, VisSankey, VisTooltip } from '@unovis/react'

import type { ChartProps } from '../types'
import { SankeyData, NodeDatum, formatVisits } from './data'

const tooltipTriggers = {
  [Sankey.selectors.link]: (l: { source: NodeDatum; target: NodeDatum; value: number }) => `
    ${l.source.label} → ${l.target.label}<br/>${formatVisits(l.value)}
  `,
}

// Labels on the inner side of the nodes: right of every column except the last one
const labelPosition = (n: { height: number }): Position => n.height === 0 ? Position.Left : Position.Right

// The "Colored flows" preset gives every node a palette color and paints each flow with the color of its source node
const nodeColor = (n: { index: number }): string => `var(${getCSSColorVariable(n.index)})`

export default function UnovisSankey ({ data, preset }: ChartProps<SankeyData>): JSX.Element {
  return (
    <VisSingleContainer data={data} height={440}>
      <VisSankey
        subLabel={(n: { value: number }) => formatVisits(n.value)}
        labelPosition={labelPosition}
        nodeWidth={preset === 'thin' ? 6 : 25}
        nodePadding={preset === 'thin' ? 24 : 12}
        nodeColor={preset === 'colors' ? nodeColor : undefined}
        linkColor={preset === 'colors' ? (l: { source: { index: number } }) => nodeColor(l.source) : undefined}
        nodeSort={preset === 'sorted' ? (a: { value: number }, b: { value: number }) => b.value - a.value : undefined}
        highlightSubtreeOnHover
      />
      <VisTooltip container={document.body} triggers={tooltipTriggers}/>
    </VisSingleContainer>
  )
}
