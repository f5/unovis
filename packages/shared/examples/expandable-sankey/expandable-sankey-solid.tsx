import { FitMode, Sankey, SankeySubLabelPlacement, VerticalAlign } from '@unovis/ts'
import { VisSankey, VisSingleContainer } from '@unovis/solid'
import { createSignal, JSX } from 'solid-js'
import type { SankeyLink, SankeyNode } from '@unovis/ts'

import { sankeyData, root, Node, Link } from './data'

const ExpandableSankey = (): JSX.Element => {
  const [data, setData] = createSignal(sankeyData)

  function toggleGroup (n: SankeyNode<Node, Link>): void {
    if (n.expandable) {
      if (n.expanded) {
        sankeyData.collapse(n)
      } else {
        sankeyData.expand(n)
      }
      setData({ nodes: sankeyData.nodes, links: sankeyData.links })
    }
  }

  const callbacks = {
    linkColor: (d: SankeyLink<Node, Link>): string => d.source.color ?? null,
    nodeCursor: (d: Node) => (d.expandable ? 'pointer' : null),
    nodeIcon: (d: Node): string =>
      d.expandable ? (d.expanded ? '-' : '+') : '',
    subLabel: (d: SankeyNode<Node, Link>): string =>
      d.depth === 0 || d.expanded
        ? ''
        : `${((d.value / root.value) * 100).toFixed(1)}%`,
    events: {
      [Sankey.selectors.node]: {
        click: toggleGroup,
      },
    },
  }

  return (
    <VisSingleContainer data={data()} height='50dvh'>
      <VisSankey
        {...callbacks}
        labelFit={FitMode.Wrap}
        labelForceWordBreak={false}
        labelMaxWidth={150}
        labelVerticalAlign={VerticalAlign.Middle}
        nodePadding={20}
        subLabelPlacement={SankeySubLabelPlacement.Inline}
      />
    </VisSingleContainer>
  )
}

export default ExpandableSankey
