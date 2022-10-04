import { Component } from '@angular/core'
import { Graph, GraphPanelConfig, GraphLayoutType } from '@unovis/ts'
import { nodes, links, sites, StatusMap, NodeDatum, LinkDatum } from './data'

@Component({
  selector: 'parallel-graph',
  templateUrl: './parallel-graph.component.html',
  styleUrls: ['./styles.css'],
})
export class ParallelGraphComponent {
  mainSite: string  = nodes[0].site

  data: { nodes: NodeDatum[], links: LinkDatum }
  panels: GraphPanelConfig[]

  setExpanded (site: string) {
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

  constructor() {
    this.setExpanded(this.mainSite)
  }

  // layout and events
  layoutType = GraphLayoutType.Parallel
  layoutGroupOrder = ['west', this.mainSite, 'east']
  events = {
    [Graph.selectors.node]: {
        click: (d: NodeDatum) => this.setExpanded(d.site)
    }
  }
  
  // node config
  nodeSize = (n: NodeDatum) => n.children ? 75 : 50
  nodeShape = (n: NodeDatum) => n.shape
  nodeGaugeValue = (n: NodeDatum) => n.score
  nodeGaugeFill = (n: NodeDatum) => StatusMap[n.status]?.color
  nodeSubLabel = (n: NodeDatum) => n.score && `${n.score}/100`
  nodeSideLabels = (n: NodeDatum) => [{
    radius: 16,
    fontSize: 12,
    ...(n.children ? { text: n.children.length } : StatusMap[n.status]),
  }]

  // link config
  linkFlow = (l: LinkDatum) => l.showTraffic
  linkStroke = (l: LinkDatum) => `${StatusMap[l.status]?.color}aa`
  linkBandWidth = (l: LinkDatum) => l.showTraffic ? 12 : 6

 
}
