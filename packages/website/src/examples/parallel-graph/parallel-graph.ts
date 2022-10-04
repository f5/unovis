import { SingleContainer, Graph, GraphLayoutType, GraphConfigInterface } from '@unovis/ts'
import { nodes, links, sites, StatusMap, NodeDatum, LinkDatum } from './data'

import './styles.css'

const container = document.getElementById('vis-container')
container.classList.add('chart')

const mainSite = nodes[0].site

const chart = new SingleContainer(container, {
  height: 650,
  component: new Graph<NodeDatum, LinkDatum>({
    layoutType: GraphLayoutType.Parallel,
    layoutGroupOrder: ['west', mainSite, 'east'],
    nodeStrokeWidth: 2,
    nodeIconSize: 20,
    nodeSize: (n: NodeDatum) => n.children ? 75 : 50,
    nodeShape: (n: NodeDatum) => n.shape,
    nodeGaugeValue: (n: NodeDatum) => n.score,
    nodeGaugeFill: (n: NodeDatum) => StatusMap[n.status]?.color,
    nodeSubLabel: (n: NodeDatum) => n.score && `${n.score}/100`,
    nodeSideLabels: (n: NodeDatum) => [{
      radius: 16,
      fontSize: 12,
      ...(n.children ? { text: n.children.length } : StatusMap[n.status]),
    }],
    linkFlow: (l: LinkDatum) => l.showTraffic,
    linkStroke: (l: LinkDatum) => `${StatusMap[l.status]?.color}aa`,
    linkBandWidth: (l: LinkDatum) => l.showTraffic ? 12 : 6,
  }),
})

function setExpanded (site: string): void {
  const expanded = site === mainSite ? [mainSite] : [mainSite, site]

  const graphConfig: GraphConfigInterface<NodeDatum, LinkDatum> = {
    ...chart.component.config,
    panels: expanded.map(site => sites[site].panel),
    events: {
      [Graph.selectors.node]: {
        click: (d) => setExpanded(d.site),
      },
    },
  }

  const graphData: { nodes: NodeDatum[]; links: LinkDatum[] } = {
    nodes: nodes.flatMap<NodeDatum>(n => expanded.includes(n.site) ? n.children : n),
    links: links.map(l => ({
      ...l,
      source: expanded.includes(l.sourceGroup) ? l.source : sites[l.sourceGroup].groupNodeId,
      target: expanded.includes(l.targetGroup) ? l.target : sites[l.targetGroup].groupNodeId,
    })),
  }

  chart.updateComponent(graphConfig)
  chart.setData(graphData)
}

setExpanded(mainSite)
