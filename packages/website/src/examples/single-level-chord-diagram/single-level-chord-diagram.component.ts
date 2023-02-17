import { Component } from '@angular/core'
import { ChordLabelAlignment } from '@unovis/ts'
import { nodes, links, NodeDatum, LinkDatum } from './data'

@Component({
  selector: 'single-level-chord-diagram',
  templateUrl: './single-level-chord-diagram.component.html',
})
export class SingleLevelChordDiagramComponent {
  data: {
    nodes: NodeDatum[];
    links: LinkDatum[];
  } = { nodes, links }

  linkColor = (l: LinkDatum): string => l.source.color
  nodeLabel = (n: NodeDatum): string => n.id
  nodeLabelAlignment = ChordLabelAlignment.Perpendicular
}
