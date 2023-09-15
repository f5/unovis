import { SingleContainer, Graph, GraphForceLayoutSettings, GraphLayoutType } from '@unovis/ts'
import { data, NodeDatum, LinkDatum } from './data'

const forceLayoutSettings: GraphForceLayoutSettings = {
  forceXStrength: 0.2,
  forceYStrength: 0.4,
  charge: -700,
}

const container = document.getElementById('vis-container')
const chart = new SingleContainer(container, {
  component: new Graph<NodeDatum, LinkDatum>({
    layoutType: GraphLayoutType.Force,
    forceLayoutSettings: forceLayoutSettings,
    linkLabel: l => ({ text: l.chapter }),
    nodeFill: n => n.color,
    nodeLabel: n => n.id,
    nodeSize: 40,
  }),
  height: '60vh',
}, data)
