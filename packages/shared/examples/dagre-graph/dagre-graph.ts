import { SingleContainer, Graph, GraphLayoutType, GraphNodeShape } from '@unovis/ts'
import { data, NodeDatum, LinkDatum } from './data'

const container = document.getElementById('vis-container')
const chart = new SingleContainer(container, {
  component: new Graph<NodeDatum, LinkDatum>({
    layoutType: GraphLayoutType.Dagre,
    nodeLabel: n => n.label,
    nodeShape: n => n.shape as GraphNodeShape,
    nodeStroke: l => l.color,
    linkFlow: l => l.active,
    linkStroke: l => l.color,
  }),
  height: 600,
}, data)
