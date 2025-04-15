import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { randomNumberGenerator } from '@/utils/data'
import { VisChordDiagram, VisSingleContainer } from '@unovis/react'
import React from 'react'

export const title = 'Node Levels'
export const subTitle = 'Side by side comparison'


const groups = ['A', 'B', 'C']
const data = {
  nodes: groups.flatMap((g, i) =>
    Array(4).fill(0).map((_, j) => ({
      id: [g, j].join(''),
      label: [g, j].join(''),
      group: groups[i],
      level: j % 2 ? 'even' : 'odd',
    }))
  ),
  links: [
    { source: 'A0', target: 'B1' },
    { source: 'A0', target: 'A2' },
    { source: 'A1', target: 'B2' },
    { source: 'B0', target: 'C1' },
    { source: 'B1', target: 'C2' },
    { source: 'C0', target: 'A2' },
  ].map((l) => ({ ...l, value: randomNumberGenerator() })),
}
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  return (
    <div style={{ display: 'flex', height: '600px', justifyContent: 'space-evenly' }}>
      <VisSingleContainer data={data}>
        <VisChordDiagram duration={props.duration}/>
      </VisSingleContainer>
      <VisSingleContainer data={data}>
        <VisChordDiagram nodeLevels={['group']} duration={props.duration}/>
      </VisSingleContainer>
      <VisSingleContainer data={data}>
        <VisChordDiagram nodeLevels={['level', 'group']} duration={props.duration}/>
      </VisSingleContainer>
    </div>
  )
}
