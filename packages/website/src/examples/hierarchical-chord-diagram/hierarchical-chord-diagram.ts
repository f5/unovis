import { SingleContainer, ChordDiagram, ChordLabelAlignment } from '@unovis/ts'
import { colorMap, nodes, links, NodeDatum, LinkDatum } from './data'

const data = { nodes, links }

const container = document.getElementById('vis-container')
const chart = new SingleContainer(container, {
  component: new ChordDiagram<NodeDatum, LinkDatum>({
    linkColor: l => colorMap.get(l.source.country),
    nodeColor: n => colorMap.get(n.country ?? n.key),
    nodeLabel: n => n.id ?? n.key,
    nodeLabelColor: n => n.height && 'var(--vis-tooltip-text-color)',
    nodeLabelAlignment: ChordLabelAlignment.Perpendicular,
  }),
  height: '60vh',
}, data)
