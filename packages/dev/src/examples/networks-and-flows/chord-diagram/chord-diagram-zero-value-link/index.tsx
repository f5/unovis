import React from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

export const title = 'Chord Diagram Zero Value Link'
export const subTitle = 'External select node'

const data = {
  nodes: Array(5).fill(0).map((_, i) => ({ id: String.fromCharCode(i + 65) })),
  links: [
    { source: 'A', target: 'B', value: undefined },
    { source: 'A', target: 'D', value: null },
    { source: 'B', target: 'E', value: 0 },
    { source: 'B', target: 'D', value: null },
    { source: 'C', target: 'D', value: 0 },
    { source: 'D', target: 'A', value: 1 },
    { source: 'D', target: 'E', value: 0 },
  ],
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  return (
    <>
      <VisSingleContainer data={data} height={600}>
        <VisChordDiagram
          nodeLabelAlignment='perpendicular'
          nodeLabel={React.useCallback((d: { id: string }) => `Segment ${d.id}`, [])}
          padAngle={0.75}
          duration={props.duration}
        />
      </VisSingleContainer>
    </>
  )
}
