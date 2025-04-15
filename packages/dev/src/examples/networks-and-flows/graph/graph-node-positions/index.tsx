import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generatePrecalculatedNodeLinkData, LinkDatum, NodeDatum } from '@/utils/data'
import { VisGraph, VisGraphRef, VisSingleContainer } from '@unovis/react'
import React, { useCallback, useMemo, useRef } from 'react'

export const title = 'Graph: Node Positions'
export const subTitle = 'Pass in node positions'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
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
