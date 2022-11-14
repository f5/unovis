import { Component } from '@angular/core'
import { GraphCircleLabel, GraphForceLayoutSettings, GraphLayoutType } from '@unovis/ts'

import { data, NodeDatum, LinkDatum } from './data'

@Component({
  selector: 'force-graph',
  templateUrl: './force-graph.component.html',
})
export class ForceLayoutGraphComponent {
  data = data
  layoutType = GraphLayoutType.Force

  forceLayoutSettings: GraphForceLayoutSettings = {
    forceXStrength: 0.2,
    forceYStrength: 0.2,
    charge: -700,
  }

  linkLabel = (l: LinkDatum): GraphCircleLabel => ({ text: l.chapter })
  nodeLabel = (n: NodeDatum): string => n.id
  nodeFill = (n: NodeDatum): string => n.color
}
