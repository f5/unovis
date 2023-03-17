import React, { useCallback } from 'react'
import { ChordHierarchyNode } from '@unovis/ts'
import { VisSingleContainer, VisChordDiagram } from '@unovis/react'
import { generateHierarchyData } from '@src/utils/data'

export const title = 'Chord Diagram Hierarchy Nodes'
export const subTitle = 'With various accessors'
export const category = 'Chord Diagram'

const levels = { a: 3, b: 5, c: 7 }
const data = generateHierarchyData(50, levels)
type NodeDatum = typeof data.nodes[0]

export const component = (): JSX.Element => {
  const getColor = useCallback((n: NodeDatum | ChordHierarchyNode<NodeDatum>) => {
    const a = (n as NodeDatum).a
    if (a === 'a0' || n.ancestors?.includes('a0')) return 'var(--vis-color0)'
    if (a === 'a1' || n.ancestors?.includes('a1')) return 'var(--vis-color1)'
    return 'var(--vis-color2)'
  }, [])
  const getLabelAlignment = useCallback((n: NodeDatum | ChordHierarchyNode<NodeDatum>) => n.height > 0 ? 'perpendicular' : 'along', [])
  const getLabel = useCallback((n: NodeDatum | ChordHierarchyNode<NodeDatum>) => (n as NodeDatum).label ?? `${n.key} (${n.depth})`, [])
  return (
    <VisSingleContainer data={data}>
      <VisChordDiagram
        nodeLevels={Object.keys(levels)}
        nodeColor={getColor}
        nodeLabel={getLabel}
        nodeLabelAlignment={getLabelAlignment}
      />
    </VisSingleContainer>
  )
}
