import { JSX } from 'solid-js'
import { ChordLabelAlignment } from '@unovis/ts'
import { VisChordDiagram, VisSingleContainer } from '@unovis/solid'

import { nodes, links, colorMap, NodeDatum, LinkDatum } from './data'

const HierarchicalChordDiagram = (): JSX.Element => {
  const data = { links, nodes }
  const linkColor = (l: LinkDatum) => colorMap.get(l.source.country)
  const nodeColor = (n: NodeDatum) => colorMap.get(n.country ?? n.key)
  const nodeLabel = (n: NodeDatum) => n.id ?? n.key
  const nodeLabelColor = (n: NodeDatum) =>
    n.height && 'var(--vis-tooltip-text-color)'

  return (
    <VisSingleContainer data={data} height='50dvh'>
      <VisChordDiagram
        nodeLevels={['country']}
        linkColor={linkColor}
        nodeColor={nodeColor}
        nodeLabel={nodeLabel}
        nodeLabelColor={nodeLabelColor}
        nodeLabelAlignment={ChordLabelAlignment.Perpendicular}
      />
    </VisSingleContainer>
  )
}

export default HierarchicalChordDiagram
