/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useMemo } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType, GraphNodeShape } from '@unovis/ts'

import { data, NodeDatum, LinkDatum, panels } from './data'

import './styles.css'

export default function ForceLayoutGraph (): JSX.Element {
  const layoutElkSettings = {
    'layered.crossingMinimization.forceNodeModelOrder': 'true',
    'elk.direction': 'RIGHT',
    'elk.padding': '[top=30.0,left=0.0,bottom=30.0,right=0.0]',
    'spacing.nodeNodeBetweenLayers': '250',
  }

  return (
    <div className='chart'>
      <VisSingleContainer data={data} height={'60vh'}>
        <VisGraph<NodeDatum, LinkDatum>
          nodeShape={GraphNodeShape.Square}
          nodeStrokeWidth={1.5}
          nodeLabel={useCallback((n: NodeDatum) => n.id, [])}
          layoutType={GraphLayoutType.Elk}
          layoutElkNodeGroups={useMemo(() => [
            (d: NodeDatum): string | null => d.group ?? null,
            (d: NodeDatum): string | null => d.subGroup ?? null,
          ], [])}
          layoutElkSettings={layoutElkSettings}
          panels={panels}
          disableZoom
        />
      </VisSingleContainer>
    </div>
  )
}

