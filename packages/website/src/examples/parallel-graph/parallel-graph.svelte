<script lang='ts'>
  import { VisSingleContainer, VisGraph } from '@unovis/svelte'
  import { Graph, GraphLayoutType } from '@unovis/ts'

  import { nodes, links, sites, StatusMap, NodeDatum, LinkDatum } from './data'
  
  const mainSite = nodes[0].site

  // Reactive statments
  let expanded = [mainSite]
  $: panels = expanded.map(site => sites[site].panel)
  $: data = {
      nodes: nodes.flatMap<NodeDatum>(n => expanded.includes(n.site) ? n.children : n),
      links: links.map(l => ({
        ...l,
        source: expanded.includes(l.sourceGroup) ? l.source : sites[l.sourceGroup].groupNodeId,
        target: expanded.includes(l.targetGroup) ? l.target : sites[l.targetGroup].groupNodeId,
      })),
    }

  // Graph config
  const graphConfig = {
    events: {
      [Graph.selectors.node]: {
        click: (d: NodeDatum) => {
          expanded = d.site === mainSite ? [mainSite] : [mainSite, d.site]
        }
      }
    },
    nodeGaugeValue: (n: NodeDatum) => n.score,
    nodeGaugeFill: (n: NodeDatum) => StatusMap[n.status]?.color,
    nodeIconSize: 20,
    nodeShape: (n: NodeDatum) => n.shape,
    nodeSideLabels: (n: NodeDatum) => [{
      radius: 16,
      fontSize: 12,
      ...(n.children ? { text: n.children.length } : StatusMap[n.status]),
    }],
    nodeSize: (n: NodeDatum) => n.children ? 75 : 50,
    nodeSubLabel: (n: NodeDatum) => n.score && `${n.score}/100`,
    nodeStrokeWidth: 2,
    linkFlow: (l: LinkDatum) => l.showTraffic,
    linkStroke: (l: LinkDatum) => `${StatusMap[l.status]?.color}aa`,
    linkBandWidth: (l: LinkDatum) => l.showTraffic ? 12 : 6,
  }
</script>

<div class="chart">
  <VisSingleContainer {data}>
    <VisGraph
      {...graphConfig}
      layoutType="{GraphLayoutType.Parallel}"
      layoutGroupOrder="{[ 'west', mainSite, 'east']}"
      {panels}
    />
  </VisSingleContainer>
</div>

<style>
  .chart {
    --vis-graph-icon-font-family: 'Font Awesome 6 Free';
    font-family: 'Font Awesome 6 Free';
  }
  @font-face {
    font-family: 'Font Awesome 6 Free';
    src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/webfonts/fa-solid-900.woff2)
        format('woff2');
  }
</style>


