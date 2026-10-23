import React from 'react'
import { ChordDiagram, ChordLabelAlignment, getCSSColorVariable } from '@unovis/ts'
import { VisSingleContainer, VisChordDiagram, VisTooltip } from '@unovis/react'

import type { ChartProps } from '../types'
import { ChordData, NodeDatum, LinkDatum, continents, formatTraffic } from './data'

// Regions are leaf nodes; with `nodeLevels` the continents become parent nodes that only have a `key`
type NodeOrGroup = Partial<NodeDatum> & { key?: string }
type ChordNode = { data: NodeOrGroup; value: number }

const tooltipTriggers = {
  [ChordDiagram.selectors.node]: (n: ChordNode) => `<b>${n.data.label ?? n.data.key}</b>: ${formatTraffic(n.value)}`,
  [ChordDiagram.selectors.link]: (l: { data: { source: NodeDatum; target: NodeDatum; value: number } }) => `
    ${l.data.source.label} ↔ ${l.data.target.label}<br/>${formatTraffic(l.data.value)}
  `,
}

export default function UnovisChordDiagram ({ data, preset }: ChartProps<ChordData>): JSX.Element {
  // Unovis draws every node in the main color by default. Like the other libraries, the demo gives each region
  // a palette color (each continent in the "Grouped" preset) and paints its ribbons with it
  const nodeColor = (n: NodeOrGroup): string => preset === 'grouped'
    ? `var(${getCSSColorVariable(continents.indexOf(n.continent ?? n.key))})`
    : `var(${getCSSColorVariable(data.nodes.findIndex(r => r.id === n.id))})`

  return (
    <VisSingleContainer data={data} height={440}>
      <VisChordDiagram<NodeDatum, LinkDatum>
        nodeLabel={(n: NodeOrGroup) => n.label ?? n.key}
        nodeColor={nodeColor}
        linkColor={(l: { source: NodeDatum }) => nodeColor(l.source)}
        nodeLevels={preset === 'grouped' ? ['continent'] : []}
        nodeLabelAlignment={preset === 'radial' ? ChordLabelAlignment.Perpendicular : ChordLabelAlignment.Along}
        nodeWidth={preset === 'gaps' ? 30 : 15}
        padAngle={preset === 'gaps' ? 0.1 : 0.02}
      />
      <VisTooltip container={document.body} triggers={tooltipTriggers}/>
    </VisSingleContainer>
  )
}
