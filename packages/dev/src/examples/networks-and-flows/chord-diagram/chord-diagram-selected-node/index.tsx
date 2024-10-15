import React, { useCallback, useState } from 'react'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Chord Diagram Node Selection'
export const subTitle = 'External select node'

const data = {
  nodes: Array(5).fill(0).map((_, i) => ({ id: String.fromCharCode(i + 65) })),
  links: [
    { source: 'A', target: 'B', value: 10 },
    { source: 'A', target: 'D', value: 5 },
    { source: 'B', target: 'E', value: 5 },
    { source: 'B', target: 'D', value: 5 },
    { source: 'C', target: 'D', value: 15 },
    { source: 'D', target: 'A', value: 10 },
    { source: 'D', target: 'E', value: 10 },
  ],
}

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const [nodeId, highlightNodeId] = useState<string | undefined>()
  const [linkIds, highlightLinkIds] = useState<number[]>()
  const highlightNode = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const node = e.target.value.length ? e.target.value : undefined
    const links = new Array<number>()
    data.links.forEach((l, i) => {
      if (l.source === node || l.target === node) { links.push(i) }
    })
    highlightNodeId(node)
    highlightLinkIds(links)
  }, [])
  return (
    <>
      <select onChange={highlightNode}>
        <option label='--Select a node to highlight--'/>
        {data.nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
      </select>
      <VisSingleContainer data={data} height={600}>
        <VisChordDiagram
          highlightedNodeId={nodeId}
          highlightedLinkIds={linkIds}
          nodeLabelAlignment='perpendicular'
          nodeLabel={React.useCallback((d: { id: string }) => `Segment ${d.id}`, [])}
          padAngle={0.75}
          duration={props.duration}
        />
      </VisSingleContainer>
    </>
  )
}
