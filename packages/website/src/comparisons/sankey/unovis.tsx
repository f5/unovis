import React from 'react'
import { Position, Sankey } from '@unovis/ts'
import { VisSingleContainer, VisSankey, VisTooltip } from '@unovis/react'

import { SankeyData, NodeDatum, formatVisits } from './data'

const tooltipTriggers = {
  [Sankey.selectors.link]: (l: { source: NodeDatum; target: NodeDatum; value: number }) => `
    ${l.source.label} → ${l.target.label}<br/>${formatVisits(l.value)}
  `,
}

// Labels on the inner side of the nodes: right of every column except the last one
const labelPosition = (n: { height: number }): Position => n.height === 0 ? Position.Left : Position.Right

export default function UnovisSankey ({ data }: { data: SankeyData }): JSX.Element {
  return (
    <VisSingleContainer data={data} height={440}>
      <VisSankey
        subLabel={(n: { value: number }) => formatVisits(n.value)}
        labelPosition={labelPosition}
        nodePadding={12}
        highlightSubtreeOnHover
      />
      <VisTooltip triggers={tooltipTriggers}/>
    </VisSingleContainer>
  )
}
