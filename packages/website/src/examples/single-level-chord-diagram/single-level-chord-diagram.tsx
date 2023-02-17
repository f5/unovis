import React, { useCallback } from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { ChordLabelAlignment } from '@unovis/ts'

import { nodes, links, NodeDatum, LinkDatum } from './data'

export default function SingleLevelChordDiagram (): JSX.Element {
  return (
    <VisSingleContainer data={{ links, nodes }} height={'60vh'}>
      <VisChordDiagram<NodeDatum, LinkDatum>
        linkColor={useCallback((l: LinkDatum): string => l.source.color)}
        nodeLabel={useCallback((n: NodeDatum): string => n.id, [])}
        nodeLabelAlignment={ChordLabelAlignment.Perpendicular}
      />
    </VisSingleContainer>
  )
}
