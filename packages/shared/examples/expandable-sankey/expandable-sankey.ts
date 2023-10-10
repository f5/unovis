import { SingleContainer, Sankey, FitMode, SankeyNode, SankeySubLabelPlacement, VerticalAlign, SankeyLink } from '@unovis/ts'
import { sankeyData, root, Node, Link } from './data'

// initialize chart
const container = document.getElementById('vis-container')
const chart = new SingleContainer(container)

// node click event listener
function toggleGroup (n: SankeyNode<Node, Link>): void {
  if (n.expandable) {
    if (n.expanded) {
      sankeyData.collapse(n)
    } else {
      sankeyData.expand(n)
    }
    chart.setData({ nodes: sankeyData.nodes, links: sankeyData.links })
  }
}

// main component
const sankey = new Sankey<Node, Link>({
  events: {
    [Sankey.selectors.node]: {
      click: toggleGroup,
    },
  },
  labelFit: FitMode.Wrap,
  labelForceWordBreak: false,
  labelMaxWidth: 150,
  labelVerticalAlign: VerticalAlign.Middle,
  linkColor: (d: SankeyLink<Node, Link>) => d.source.color ?? null,
  nodeCursor: (d: Node) => d.expandable ? 'pointer' : null,
  nodeIcon: (d: Node) => d.expandable ? (d.expanded ? '-' : '+') : '',
  nodePadding: 20,
  subLabel: (d: SankeyNode<Node, Link>): string => ((d.depth === 0) || d.expanded)
    ? ''
    : `${((d.value / root.value) * 100).toFixed(1)}%`,
  subLabelPlacement: window.innerHeight > window.innerWidth
    ? SankeySubLabelPlacement.Below
    : SankeySubLabelPlacement.Inline,
})


chart.update({
  component: sankey,
  height: 'min(60vh,75vw)',
}, sankey.config, sankeyData)


