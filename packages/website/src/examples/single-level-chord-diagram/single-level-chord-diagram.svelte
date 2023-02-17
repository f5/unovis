<script lang='ts'>
  import { VisSingleContainer, VisChordDiagram } from '@unovis/svelte'
  import { ChordLabelAlignment } from '@unovis/ts'
  import { links, nodes, LinkDatum, NodeDatum } from './data'

  const data = { links, nodes }
  const linkColor = (l: LinkDatum) => l.source.color
  const nodeLabel = (n: NodeDatum) => n.id
</script>

<VisSingleContainer data={data} height={'60vh'}>
  <VisChordDiagram
    {linkColor}
    {nodeLabel}
    nodeLabelAlignment={ChordLabelAlignment.Perpendicular}
  />
</VisSingleContainer>
