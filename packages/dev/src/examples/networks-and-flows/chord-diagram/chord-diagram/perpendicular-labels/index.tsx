import React, { useCallback } from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { data, NodeDatum } from './data'

export const title = 'Basic Chord Diagram'
export const subTitle = 'Perpendicular label alignment'

export const component = (): JSX.Element => {
  return (
    <VisSingleContainer data={data} style={{ width: '100%', height: '100%' }}>
      <VisChordDiagram
        linkValue={1}
        nodeLabel={useCallback((n: NodeDatum) => n.id, [])}
        nodeLabelAlignment='perpendicular'
      />
    </VisSingleContainer>
  )
}
