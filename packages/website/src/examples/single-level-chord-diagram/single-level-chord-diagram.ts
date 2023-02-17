import { SingleContainer, ChordDiagram, ChordLabelAlignment } from '@unovis/ts'
import { nodes, links, NodeDatum, LinkDatum } from './data'

const data = { nodes, links }

const container = document.getElementById('vis-container')
const chart = new SingleContainer(container, {
  component: new ChordDiagram<NodeDatum, LinkDatum>({
    linkColor: l => l.source.color,
    nodeLabel: n => n.id,
    nodeLabelAlignment: ChordLabelAlignment.Perpendicular,
  }),
  height: '60vh',
}, data)
