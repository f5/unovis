import { Component } from '@angular/core'
import { Graph, GraphPanelConfig, GraphLayoutType, GraphNodeShape, GraphCircleLabel } from '@unovis/ts'
import { nodes, links, sites, StatusMap, NodeDatum, LinkDatum } from './data'

@Component({
  selector: 'parallel-graph',
  templateUrl: './parallel-graph.component.html',
  styleUrls: ['./styles.css'],
})
export class ParallelGraphComponent {
  mainSite: string = nodes[0].site

  data: { nodes: NodeDatum[]; links: LinkDatum[] }
  panels: GraphPanelConfig[]

  setExpanded (site: string): void {
    const expanded = site === this.mainSite ? [this.mainSite] : [site, this.mainSite]
    this.panels = expanded.map(site => sites[site].panel)
    this.data = {
      nodes: nodes.flatMap<NodeDatum>(n => expanded.includes(n.site) ? n.children : n),
      links: links.map(l => ({
        ...l,
        source: expanded.includes(l.sourceGroup) ? l.source : sites[l.sourceGroup].groupNodeId,
        target: expanded.includes(l.targetGroup) ? l.target : sites[l.targetGroup].groupNodeId,
      })),
    }
  }

  constructor () {
    this.setExpanded(this.mainSite)
  }

  // layout and events
  layoutType = GraphLayoutType.Parallel
  layoutGroupOrder = ['west', this.mainSite, 'east']
  layoutParallelNodesPerColumn = 4
  events = {
    [Graph.selectors.node]: {
      click: (d: NodeDatum) => this.setExpanded(d.site),
    },
  }

  // node config
  nodeSize = (n: NodeDatum): number => n.children ? 75 : 50
  nodeIconSize = 20
  nodeShape = (n: NodeDatum): GraphNodeShape => n.shape
  nodeStrokeWidth = 3
  nodeGaugeValue = (n: NodeDatum): number => n.score
  nodeGaugeFill = (n: NodeDatum): string => StatusMap[n.status]?.color
  nodeSubLabel = (n: NodeDatum): string => n.score && `${n.score}/100`
  nodeSideLabels = (n: NodeDatum): GraphCircleLabel[] => [{
    radius: 16,
    fontSize: 12,
    ...(n.children ? { text: n.children.length } : StatusMap[n.status]),
  }]

  // link config
  linkFlow = (l: LinkDatum): boolean => l.showTraffic
  linkStroke = (l: LinkDatum): string => StatusMap[l.status]?.color || null
  linkBandWidth = (l: LinkDatum): number => l.showTraffic ? 12 : 6
}
