import { Graph, GraphLayoutType } from '@unovis/ts'
import { createMemo, createSignal, JSX } from 'solid-js'
import { VisGraph, VisSingleContainer } from '@unovis/solid'

import './styles.css'

import { nodes, links, sites, StatusMap, NodeDatum, LinkDatum } from './data'

const ParallelGraph = (): JSX.Element => {
  const mainSite = nodes[0].site

  // Reactive statements
  const [expanded, setExpanded] = createSignal([mainSite])
  const panels = createMemo(() => expanded().map((site) => sites[site].panel))
  const data = createMemo(() => ({
    nodes: nodes.flatMap<NodeDatum>((n) =>
      expanded().includes(n.site) ? n.children : n
    ),
    links: links.map((l) => ({
      ...l,
      source: expanded().includes(l.sourceGroup)
        ? l.source
        : sites[l.sourceGroup].groupNodeId,
      target: expanded().includes(l.targetGroup)
        ? l.target
        : sites[l.targetGroup].groupNodeId,
    })),
  }))

  // Graph config
  const graphConfig = createMemo(() => ({
    events: {
      [Graph.selectors.node]: {
        click: (d: NodeDatum) => {
          setExpanded(d.site === mainSite ? [mainSite] : [mainSite, d.site])
        },
      },
    },
    nodeGaugeValue: (n: NodeDatum) => n.score,
    nodeGaugeFill: (n: NodeDatum) => StatusMap[n.status]?.color,
    nodeIconSize: 20,
    nodeShape: (n: NodeDatum) => n.shape,
    nodeSideLabels: (n: NodeDatum) => [
      {
        radius: 16,
        fontSize: 12,
        ...(n.children ? { text: n.children.length } : StatusMap[n.status]),
      },
    ],
    nodeSize: (n: NodeDatum) => (n.children ? 75 : 50),
    nodeSubLabel: (n: NodeDatum) => n.score && `${n.score}/100`,
    nodeStrokeWidth: 3,
    linkFlow: (l: LinkDatum) => l.showTraffic,
    linkStroke: (l: LinkDatum) => StatusMap[l.status]?.color || null,
    linkBandWidth: (l: LinkDatum) => (l.showTraffic ? 12 : 6),
  }))

  return (
    <div class='chart'>
      <VisSingleContainer data={data()} height='50dvh'>
        <VisGraph
          {...graphConfig()}
          layoutType={GraphLayoutType.Parallel}
          layoutGroupOrder={['west', mainSite, 'east']}
          layoutParallelNodesPerColumn={4}
          panels={panels()}
          disableZoom
        />
      </VisSingleContainer>
    </div>
  )
}

export default ParallelGraph
