import React, { useCallback, useMemo, useRef } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef } from '@unovis/react'
import { generatePrecalculatedNodeLinkData, NodeDatum, LinkDatum } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Graph: Node Positions'
export const subTitle = 'Pass in node positions'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = useMemo(() => generatePrecalculatedNodeLinkData(), [])
  const ref = useRef<VisGraphRef<NodeDatum, LinkDatum>>(null)


  return (
    <VisSingleContainer data={data} height={600}>
      <VisGraph
        ref={ref}
        layoutType="precalculated"
        linkCurvature={1}
        nodeIcon={useCallback((n: NodeDatum) => n.id, [])}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}

