<script lang="ts">
  import { VisSingleContainer, VisChordDiagram } from '@unovis/svelte'
  import { ChordLabelAlignment } from '@unovis/ts'
  import type { ChordHierarchyNode } from '@unovis/ts'
  import type { LinkDatum, NodeDatum } from './data'
  import { colorMap, links, nodes } from './data'

  const data = { links, nodes }
  const linkColor = (l: LinkDatum) => colorMap.get(l.source.country)
  const nodeColor = (n: NodeDatum) => colorMap.get(n.country ?? n.key)
  const nodeLabel = (n: NodeDatum) => n.id ?? n.key
  const nodeLabelColor = (n: NodeDatum) => n.height && 'var(--vis-tooltip-text-color)'
</script>

<VisSingleContainer {data} height={'60vh'}>
  <VisChordDiagram
    {linkColor}
    {nodeColor}
    {nodeLabel}
    {nodeLabelColor}
    nodeLabelAlignment={ChordLabelAlignment.Perpendicular}
  />
</VisSingleContainer>
