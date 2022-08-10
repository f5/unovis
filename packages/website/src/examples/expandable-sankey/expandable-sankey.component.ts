import { Component } from '@angular/core'
import { Sankey, SankeyNode } from '@volterra/vis'

import { getColor, getChildren, LinkDatum, NodeDatum, sankeyData, sourceNode } from './data'

@Component({
  selector: 'expandable-sankey',
  templateUrl: './expandable-sankey.component.html'
})
export class ExpandableSankeyComponent {
  data = {
    nodes: [sourceNode, ...getChildren(sourceNode)],
    links: sankeyData.links
  }

  nodeColor = getColor
  nodeIcon = (d: NodeDatum): string => !d.expandable ? '' : (d.expanded ? '-' : '+')
  subLabel = (d: NodeDatum): string => {
    if (d.expanded) return ''
    return `${((d.value / sourceNode.value) * 100).toFixed(1)}%`
  }
  linkColor = (d: LinkDatum) => getColor(d.source)

  events = () => ({
    [Sankey.selectors.node]: {
      click: this.toggleGroup,
    }
  })

  toggleGroup (n: SankeyNode<NodeDatum, LinkDatum>): void {
    if (!n.expandable) return
    const nodes = [...this.data.nodes]
    nodes[n.index].expanded = !nodes[n.index].expanded
    n.sourceLinks.forEach(d => {
      nodes[d.index].expanded = false
    })

    this.data = {
      nodes: n.expanded
        ? nodes.filter(d => !d.id.startsWith(n.id) || d.level <= n.layer)
        : [...nodes, ...getChildren(n)],
      links: this.data.links,
    }
  }
}