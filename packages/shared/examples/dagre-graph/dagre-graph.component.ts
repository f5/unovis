import { Component } from '@angular/core'
import { GraphLayoutType } from '@unovis/ts'

import { data, NodeDatum, LinkDatum } from './data'

@Component({
  selector: 'dagre-graph',
  templateUrl: './dagre-graph.component.html',
  standalone: false,
})
export class BasicGraphComponent {
  data = data
  layoutType = GraphLayoutType.Dagre
  nodeLabel = (n: NodeDatum): string => n.label
  nodeShape = (n: NodeDatum): string => n.shape
  nodeStroke = (l: LinkDatum): string => l.color
  linkFlow = (l: LinkDatum): boolean => l.active
  linkStroke = (l: LinkDatum): string => l.color
}
