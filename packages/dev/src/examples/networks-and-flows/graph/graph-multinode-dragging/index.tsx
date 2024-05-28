import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { generateNodeLinkData } from '@src/utils/data'

export const title = 'Graph Brushing'
export const subTitle = ''
const data = generateNodeLinkData(100)

export const component = (): JSX.Element => {
  return (
    <>
      <VisSingleContainer data={data} height={'100vh'}>
        <VisGraph
          nodeLabel={n => String(n.id)}
          // disableZoom={true}
          // onNodeSelectionBrush={console.log}
          // onNodeSelectionDrag={console.log}
        />
      </VisSingleContainer>
    </>
  )
}

