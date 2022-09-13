import { SingleContainer, Sankey, FitMode, SankeyNode, SankeySubLabelPlacement, VerticalAlign, SankeyLink } from '@unovis/ts'
import { getColor, getChildren, LinkDatum, NodeDatum, sankeyData, sourceNode } from './data'

// initial data
let data = {
  nodes: [sourceNode, ...getChildren(sourceNode)],
  links: sankeyData.links,
}

// initialize chart
const container = document.getElementById('#vis-container')
const chart = new SingleContainer(container)

// node click event listener
function toggleGroup (n: SankeyNode<NodeDatum, LinkDatum>): void {
  if (!n.expandable) return
  const nodes = [...data.nodes]
  nodes[n.index].expanded = !nodes[n.index].expanded
  n.sourceLinks.forEach(d => {
    nodes[d.index].expanded = false
  })

  data = {
    nodes: n.expanded
      ? nodes.filter(d => !d.id.startsWith(n.id) || d.level <= n.layer)
      : [...nodes, ...getChildren(n)],
    links: data.links,
  }
  chart.setData(data)
}

// main component
const sankey = new Sankey<NodeDatum, LinkDatum>({
  labelFit: FitMode.Wrap,
  labelForceWordBreak: false,
  labelMaxWidth: 150,
  labelVerticalAlign: VerticalAlign.Middle,
  nodeCursor: (d: SankeyNode<NodeDatum, LinkDatum>) => d.expandable ? 'pointer' : null,
  nodePadding: 20,
  nodeColor: getColor,
  linkColor: (d: SankeyLink<NodeDatum, LinkDatum>) => getColor(d.source),
  nodeIcon: (d: NodeDatum) => d.expandable ? (d.expanded ? '-' : '+') : '',
  subLabel: (d: SankeyNode<NodeDatum, LinkDatum>): string => ((d.depth === 0) || d.expanded) ? '' : `${((d.value / sourceNode.value) * 100).toFixed(1)}%`,
  subLabelPlacement: SankeySubLabelPlacement.Inline,
  events: {
    [Sankey.selectors.node]: {
      click: toggleGroup,
    },
  },
})

chart.update({
  component: sankey,
  height: 600,
}, sankey.config, data)


