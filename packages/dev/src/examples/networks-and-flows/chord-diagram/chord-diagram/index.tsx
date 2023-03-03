import React from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'

export const title = 'Node Levels'
export const subTitle = 'Side by side comparison'
export const category = 'Chord Diagram'

const groups = ['A', 'B', 'C']
const data = {
  nodes: groups.flatMap((g, i) =>
    Array(4).fill(0).map((_, j) => ({
      id: [g, j].join(''),
      label: [g, i].join(''),
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
  ].map((l) => ({ ...l, value: Math.random() })),
}

export const component = (): JSX.Element => {
  return (
    <div style={{ display: 'flex', height: '600px' }}>
      <VisSingleContainer data={data}>
        <VisChordDiagram/>
      </VisSingleContainer>
      <VisSingleContainer data={data}>
        <VisChordDiagram nodeLevels={['group']}/>
      </VisSingleContainer>
      <VisSingleContainer data={data}>
        <VisChordDiagram nodeLevels={['group', 'level']}/>
      </VisSingleContainer>
    </div>
  )
}
