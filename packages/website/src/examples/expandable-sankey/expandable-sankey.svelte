<script lang='ts'>
  import { FitMode, Sankey, SankeyNode, SankeySubLabelPlacement, VerticalAlign } from '@volterra/vis'
  import { VisSingleContainer, VisSankey } from '@volterra/vis-svelte'
  import { getColor, getChildren, LinkDatum, NodeDatum, sankeyData, sourceNode } from './data'

  let data = {
    nodes: [sourceNode, ...sankeyData.nodes.filter(d => sourceNode.subgroups.includes(d.id))],
    links: sankeyData.links
  }

  function toggleGroup (n: SankeyNode<NodeDatum, LinkDatum>): void {
    if (!n.expandable) return
    const nodes = [...data.nodes]
    nodes[n.index].expanded = !nodes[n.index].expanded
    n.sourceLinks.forEach(d => {
      nodes[d.index].expanded = false
    })
  
    data = {
      nodes: n.expanded
        ? nodes.filter(d => !d.id.startsWith(n.id) || d.level <= n.layer)
        : [...nodes, ...sankeyData.nodes.filter(d => n.subgroups.includes(d.id))],
      links: data.links,
    }
  }

  const callbacks = {
    linkColor: (d: LinkDatum): string => d.source,
    nodeColor: getColor,
    nodeIcon: (d: NodeDatum): string =>  d.expandable ? (d.expanded ? '-' : '+') : '',
    subLabel: (d: NodeDatum): string =>  d.expanded ? '' : `${((d.value / sourceNode.value) * 100).toFixed(1)}%`,
    events: {
      [Sankey.selectors.node]: {
        click: toggleGroup,
      },
    }
  }
</script>

<VisSingleContainer {data} height={600}>
  <VisSankey
    {...callbacks}
    labelFit={FitMode.Wrap}
    labelForceWordBreak={false}
    labelMaxWidth={150}
    labelVerticalAlign={VerticalAlign.Middle}
    nodePadding={20}
    nodeCursor='pointer'
    subLabelPlacement={SankeySubLabelPlacement.Inline}
  />
</VisSingleContainer>
