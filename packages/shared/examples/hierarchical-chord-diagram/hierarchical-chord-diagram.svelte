<script lang='ts'>
  import { VisSingleContainer, VisChordDiagram } from '@unovis/svelte'
  import { ChordHierarchyNode, ChordLabelAlignment } from '@unovis/ts'
  import { colorMap, links, nodes, LinkDatum, NodeDatum } from './data'

  const data = { links, nodes }
  const linkColor = (l: LinkDatum) => colorMap.get(l.source.country)
  const nodeColor = (n: NodeDatum) => colorMap.get(n.country ?? n.key)
  const nodeLabel = (n: NodeDatum) => n.id ?? n.key
  const nodeLabelColor = (n: NodeDatum) => n.height && 'var(--vis-tooltip-text-color)'
</script>

<VisSingleContainer data={data} height={'60vh'}>
  <VisChordDiagram
    {linkColor}
    {nodeColor}
    {nodeLabel}
    {nodeLabelColor}
    nodeLabelAlignment={ChordLabelAlignment.Perpendicular}
  />
</VisSingleContainer>
