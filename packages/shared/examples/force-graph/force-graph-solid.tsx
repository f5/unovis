import { JSX } from 'solid-js'
import { GraphForceLayoutSettings, GraphLayoutType } from '@unovis/ts'
import { VisGraph, VisSingleContainer } from '@unovis/solid'

import { data, NodeDatum, LinkDatum } from './data'

const ForceGraph = (): JSX.Element => {
  const forceLayoutSettings: GraphForceLayoutSettings = {
    forceXStrength: 0.2,
    forceYStrength: 0.4,
    charge: -700,
  }
  const linkLabel = (l: LinkDatum) => ({ text: l.chapter })
  const nodeLabel = (n: NodeDatum) => n.id
  const nodeFill = (n: NodeDatum) => n.color

  return (
    <VisSingleContainer data={data} height='50dvh'>
      <VisGraph
        layoutType={GraphLayoutType.Force}
        nodeSize={40}
        forceLayoutSettings={forceLayoutSettings}
        linkLabel={linkLabel}
        nodeFill={nodeFill}
        nodeLabel={nodeLabel}
      />
    </VisSingleContainer>
  )
}

export default ForceGraph
