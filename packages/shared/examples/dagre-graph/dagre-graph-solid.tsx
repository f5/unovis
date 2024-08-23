import { JSX } from 'solid-js'
import { GraphLayoutType, GraphNodeShape } from '@unovis/ts'
import { VisGraph, VisSingleContainer } from '@unovis/solid'

import { data, NodeDatum, LinkDatum } from './data'

const DagreGraph = (): JSX.Element => {
  const layoutType = GraphLayoutType.Dagre
  const nodeLabel = (n: NodeDatum) => n.label
  const nodeShape = (n: NodeDatum) => n.shape as GraphNodeShape
  const nodeStroke = (l: LinkDatum) => l.color
  const linkFlow = (l: LinkDatum) => l.active
  const linkStroke = (l: LinkDatum) => l.color

  return (
    <VisSingleContainer data={data} height='50dvh'>
      <VisGraph
        layoutType={layoutType}
        nodeLabel={nodeLabel}
        nodeShape={nodeShape}
        nodeStroke={nodeStroke}
        linkFlow={linkFlow}
        linkStroke={linkStroke}
        data={data}
        disableZoom
      />
    </VisSingleContainer>
  )
}

export default DagreGraph
