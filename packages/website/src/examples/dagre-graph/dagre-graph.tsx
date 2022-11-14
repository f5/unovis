import React, { useCallback } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType } from '@unovis/ts'

import { data, NodeDatum, LinkDatum } from './data'

export default function BasicGraph (): JSX.Element {
  return (
    <VisSingleContainer data={data} height={'60vh'}>
      <VisGraph<NodeDatum, LinkDatum>
        layoutType={GraphLayoutType.Dagre}
        nodeLabel={useCallback(n => n.label, [])}
        nodeShape={useCallback(n => n.shape, [])}
        nodeStroke={useCallback(l => l.color, [])}
        linkFlow={useCallback(l => l.active, [])}
        linkStroke={useCallback(l => l.color, [])}
        disableZoom={true}
      />
    </VisSingleContainer>
  )
}

