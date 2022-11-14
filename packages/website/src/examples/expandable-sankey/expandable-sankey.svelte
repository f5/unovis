<script lang='ts'>
  import { FitMode, Sankey, SankeyNode, SankeySubLabelPlacement, VerticalAlign } from '@unovis/ts'
  import { VisSingleContainer, VisSankey } from '@unovis/svelte'
  import { getColor, getChildren, LinkDatum, NodeDatum, sankeyData, sourceNode } from './data'

  let data = {
    nodes: [sourceNode, ...sankeyData.nodes.filter(d => sourceNode.subgroups.includes(d.id))],
    links: sankeyData.links,
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
    nodeIcon: (d: NodeDatum): string => d.expandable ? (d.expanded ? '-' : '+') : '',
    nodeCursor: (d: SankeyNode<NodeDatum, LinkDatum>) => d.expandable ? 'pointer' : null,
    subLabel: (d: SankeyNode<NodeDatum, LinkDatum>): string => ((d.depth === 0) || d.expanded) ? '' : `${((d.value / sourceNode.value) * 100).toFixed(1)}%`,
    events: {
      [Sankey.selectors.node]: {
        click: toggleGroup,
      },
    },
  }
</script>

<VisSingleContainer {data} height={'60vh'}>
  <VisSankey
    {...callbacks}
    labelFit={FitMode.Wrap}
    labelForceWordBreak={false}
    labelMaxWidth={150}
    labelVerticalAlign={VerticalAlign.Middle}
    nodePadding={20}
    subLabelPlacement={SankeySubLabelPlacement.Inline}
  />
</VisSingleContainer>
