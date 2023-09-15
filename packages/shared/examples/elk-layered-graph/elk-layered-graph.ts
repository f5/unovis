import { SingleContainer, Graph, GraphLayoutType, GraphNodeShape } from '@unovis/ts'
import { data, NodeDatum, LinkDatum, panels } from './data'
import './styles.css'

const layoutElkSettings = {
  'layered.crossingMinimization.forceNodeModelOrder': 'true',
  'elk.direction': 'RIGHT',
  'elk.padding': '[top=30.0,left=10.0,bottom=30.0,right=10.0]',
  'nodePlacement.strategy': 'SIMPLE',
}

const container = document.getElementById('vis-container')
container.classList.add('chart')

const chart = new SingleContainer(container, {
  component: new Graph<NodeDatum, LinkDatum>({
    nodeShape: GraphNodeShape.Square,
    nodeStrokeWidth: 1.5,
    nodeLabel: (n: NodeDatum) => n.id,
    layoutType: GraphLayoutType.Elk,
    layoutElkSettings: layoutElkSettings,
    layoutElkNodeGroups: [
      (d: NodeDatum): string | null => d.group ?? null,
      (d: NodeDatum): string | null => d.subGroup ?? null,
    ],
    panels: panels,
    disableZoom: true,
  }),
  height: '60vh',
}, data)
