import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateNodeLinkData } from '@/utils/data'
import { VisGraph, VisSingleContainer } from '@unovis/react'
import React from 'react'

export const title = 'Graph Brushing'
export const subTitle = ''
const data = generateNodeLinkData(100)

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
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
