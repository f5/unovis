import { Component } from '@angular/core'
import { ChordLabelAlignment } from '@unovis/ts'
import { colorMap, nodes, links, NodeDatum, LinkDatum } from './data'

@Component({
  selector: 'hierarchical-chord-diagram',
  templateUrl: './hierarchical-chord-diagram.component.html',
  standalone: false,
})
export class HierarchicalChordDiagramComponent {
  data: {
    nodes: NodeDatum[];
    links: LinkDatum[];
  } = { nodes, links }

  linkColor = (l: LinkDatum): string => colorMap.get(l.source.country)
  nodeColor = (n: NodeDatum): string => colorMap.get(n.country ?? n.key)
  nodeLabel = (n: NodeDatum): string => n.id ?? n.key
  nodeLabelColor = (n: NodeDatum): string => n.height && 'var(--vis-tooltip-text-color)'
  nodeLabelAlignment = ChordLabelAlignment.Perpendicular
}
