import React, { useCallback } from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { data, NodeDatum } from './data'


export const title = 'Basic Chord Diagram'
export const subTitle = 'Perpendicular label alignment'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  return (
    <VisSingleContainer data={data} style={{ width: '100%', height: '100%' }}>
      <VisChordDiagram
        linkValue={1}
        nodeLevels={['group']}
        nodeLabel={useCallback((n: NodeDatum) => n.id, [])}
        nodeLabelAlignment='perpendicular'
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
