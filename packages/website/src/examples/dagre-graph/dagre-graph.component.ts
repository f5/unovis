import { Component } from '@angular/core'
import { GraphLayoutType, GraphNodeShape } from '@unovis/ts'

import { data, NodeDatum, LinkDatum } from './data'

@Component({
  selector: 'dagre-graph',
  templateUrl: './dagre-graph.component.html',
})
export class BasicGraphComponent {
  data = data
  layoutType = GraphLayoutType.Dagre
  nodeLabel = (n: NodeDatum) => n.label
  nodeShape = (n: NodeDatum) => n.shape as GraphNodeShape
  nodeStroke = (l: LinkDatum) => l.color
  linkFlow = (l: LinkDatum) => l.active
  linkStroke = (l: LinkDatum) => l.color
}
