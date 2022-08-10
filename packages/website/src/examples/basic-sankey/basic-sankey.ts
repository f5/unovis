import { SingleContainer, Sankey, FitMode } from '@volterra/vis'
import { data, NodeDatum, LinkDatum } from './data'

const container = document.getElementById('#vis-container')
const chart = new SingleContainer(container, {
  component: new Sankey<NodeDatum, LinkDatum>({
    labelFit: FitMode.Wrap,
    labelForceWordBreak: false,
    labelMaxWidth: 150,
    nodePadding: 20,
    subLabel: (d: NodeDatum): string => `£${d.value.toFixed(2)}`,
  }),
  height: 400,
}, data)
