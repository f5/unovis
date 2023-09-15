import { Component } from '@angular/core'
import { GraphLayoutType, GraphNodeShape } from '@unovis/ts'

import { data, NodeDatum, panels } from './data'

@Component({
  selector: 'elk-graph',
  templateUrl: './elk-layered-graph.component.html',
  styleUrls: ['./styles.css'],
})
export class ElkLayeredGraphComponent {
  data = data
  layoutType = GraphLayoutType.Elk

  nodeShape = GraphNodeShape.Square
  nodeStrokeWidth = 1.5
  nodeLabel = (n: NodeDatum): string => n.id
  panels = panels
  layoutElkNodeGroups = [
    (d: NodeDatum): string | null => d.group ?? null,
    (d: NodeDatum): string | null => d.subGroup ?? null,
  ]

  layoutElkSettings = {
    'layered.crossingMinimization.forceNodeModelOrder': 'true',
    'elk.direction': 'RIGHT',
    'elk.padding': '[top=30.0,left=10.0,bottom=30.0,right=10.0]',
    'nodePlacement.strategy': 'SIMPLE',
  }
}
