import React, { useCallback, useMemo } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphForceLayoutSettings, GraphLayoutType } from '@unovis/ts'

import { data, NodeDatum, LinkDatum } from './data'

export default function ForceLayoutGraph (): JSX.Element {
  const forceLayoutSettings: GraphForceLayoutSettings = {
    forceXStrength: 0.2,
    forceYStrength: 0.4,
    charge: -700,
  }
  return (
    <VisSingleContainer data={data}>
      <VisGraph<NodeDatum, LinkDatum>
        layoutType={GraphLayoutType.Force}
        forceLayoutSettings={useMemo(() => forceLayoutSettings, [])}
        linkLabel={useCallback((l: LinkDatum) => ({ text: l.chapter }), [])}
        nodeFill={useCallback((n: NodeDatum) => n.color, [])}
        nodeLabel={useCallback(n => n.id, [])}
        nodeSize={40}
      />
    </VisSingleContainer>
  )
}

