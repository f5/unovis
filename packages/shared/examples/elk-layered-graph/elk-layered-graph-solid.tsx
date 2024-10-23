import { JSX } from 'solid-js'
import { GraphLayoutType, GraphNodeShape } from '@unovis/ts'
import { VisGraph, VisSingleContainer } from '@unovis/solid'

import './styles.css'

import { data, NodeDatum, panels } from './data'

const ElkLayerdGraph = (): JSX.Element => {
  const layoutElkSettings = {
    'layered.crossingMinimization.forceNodeModelOrder': 'true',
    'elk.direction': 'RIGHT',
    'elk.padding': '[top=30.0,left=10.0,bottom=30.0,right=10.0]',
    'nodePlacement.strategy': 'SIMPLE',
  }

  const nodeShape = GraphNodeShape.Square
  const nodeStrokeWidth = 1.5
  const nodeLabel = (n: NodeDatum) => n.id
  const layoutType = GraphLayoutType.Elk
  const layoutElkNodeGroups = [
    (d: NodeDatum) => d.group ?? null,
    (d: NodeDatum) => d.subGroup ?? null,
  ]

  return (
    <div class="chart">
      <VisSingleContainer data={data} height="50dvh">
        <VisGraph
          nodeShape={nodeShape}
          nodeStrokeWidth={nodeStrokeWidth}
          nodeLabel={nodeLabel}
          layoutType={layoutType}
          layoutElkNodeGroups={layoutElkNodeGroups}
          layoutElkSettings={layoutElkSettings}
          panels={panels}
          disableZoom
        />
      </VisSingleContainer>
    </div>
  )
}

export default ElkLayerdGraph
