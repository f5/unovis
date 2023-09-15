import React, { useCallback } from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { ChordLabelAlignment } from '@unovis/ts'

import { nodes, links, colorMap, NodeDatum, LinkDatum } from './data'

export default function HierarchicalChordDiagram (): JSX.Element {
  return (
    <VisSingleContainer data={{ links, nodes }} height={'60vh'}>
      <VisChordDiagram<NodeDatum, LinkDatum>
        nodeLevels={['country']}
        linkColor={useCallback(l => colorMap.get(l.source.country), [])}
        nodeColor={useCallback(n => colorMap.get(n.country ?? n.key), [])}
        nodeLabel={useCallback(n => n.id ?? n.key, [])}
        nodeLabelColor={useCallback(n => n.height && 'var(--vis-tooltip-text-color)', [])}
        nodeLabelAlignment={ChordLabelAlignment.Perpendicular}
      />
    </VisSingleContainer>
  )
}
