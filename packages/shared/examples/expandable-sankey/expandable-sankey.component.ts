import { Component, ViewChild } from '@angular/core'
import { VisSingleContainerComponent } from '@unovis/angular'
import { Sankey, SankeyLink, SankeyNode } from '@unovis/ts'

import { sankeyData, root, Node, Link } from './data'

@Component({
  selector: 'expandable-sankey',
  templateUrl: './expandable-sankey.component.html',
})
export class ExpandableSankeyComponent {
  @ViewChild('vis') vis: VisSingleContainerComponent<{ nodes: Node[]; links: Link[] }>

  data = { nodes: sankeyData.nodes, links: sankeyData.links }

  events = {
    [Sankey.selectors.node]: {
      click: this.toggleGroup.bind(this),
    },
  }

  linkColor = (d: SankeyLink<Node, Link>): string => d.source.color ?? null
  nodeCursor = (d: SankeyNode<Node, Link>): string => d.expandable ? 'pointer' : null
  nodeIcon = (d: SankeyNode<Node, Link>): string => !d.expandable ? '' : (d.expanded ? '-' : '+')
  subLabel = (d: SankeyNode<Node, Link>): string => {
    if (d.expanded || d.depth === 0) return ''
    return `${((d.value / root.value) * 100).toFixed(1)}%`
  }

  toggleGroup (n: SankeyNode<Node, Link>): void {
    if (n.expandable) {
      if (n.expanded) {
        sankeyData.collapse(n)
      } else {
        sankeyData.expand(n)
      }
      this.vis.chart.setData(sankeyData)
    }
  }
}
