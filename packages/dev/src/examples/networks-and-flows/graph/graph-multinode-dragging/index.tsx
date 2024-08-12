import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { generateNodeLinkData } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Graph Brushing'
export const subTitle = ''
const data = generateNodeLinkData(100)

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  return (
    <>
      <VisSingleContainer data={data} height={'100vh'}>
        <VisGraph
          nodeLabel={n => String(n.id)}
          duration={props.duration}
          // disableZoom={true}
          // onNodeSelectionBrush={console.log}
          // onNodeSelectionDrag={console.log}
        />
      </VisSingleContainer>
    </>
  )
}

