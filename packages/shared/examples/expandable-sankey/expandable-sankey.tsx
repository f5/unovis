import React, { useCallback, useState } from 'react'
import { FitMode, Sankey, SankeyLink, SankeyNode, SankeySubLabelPlacement, VerticalAlign } from '@unovis/ts'
import { VisSingleContainer, VisSankey } from '@unovis/react'

import { sankeyData, root, Node, Link } from './data'

export default function ExpandableSankey (): JSX.Element {
  const subLabelPlacement = window.innerHeight > window.innerWidth
    ? SankeySubLabelPlacement.Below
    : SankeySubLabelPlacement.Inline

  const [data, setData] = useState<{ nodes: Node[]; links: Link[] }>(sankeyData)

  const toggleGroup = useCallback((n: Node): void => {
    if (n.expandable) {
      if (n.expanded) {
        sankeyData.collapse(n)
      } else {
        sankeyData.expand(n)
      }
      n.expanded = !n.expanded
      setData({ nodes: sankeyData.nodes, links: sankeyData.links })
    }
  }, [data])

  return (
    <VisSingleContainer data={data} height={'min(60vh,75vw)'}>
      <VisSankey
        labelFit={FitMode.Wrap}
        labelForceWordBreak={false}
        labelMaxWidth={window.innerWidth * 0.12}
        labelVerticalAlign={VerticalAlign.Middle}
        nodeIcon={useCallback((d: Node) => d.expandable ? (d.expanded ? '-' : '+') : '', [])}
        nodeCursor={useCallback((d: Node) => d.expandable ? 'pointer' : null, [])}
        nodePadding={20}
        linkColor={useCallback((d: SankeyLink<Node, Link>) => d.source.color ?? null, [])}
        subLabelPlacement={subLabelPlacement}
        subLabel={useCallback((d: SankeyNode<Node, Link>) => ((d.depth === 0) || d.expanded)
          ? ''
          : `${((d.value / root.value) * 100).toFixed(1)}%`
        , [])}
        events={{
          [Sankey.selectors.node]: {
            click: toggleGroup,
          },
        }}
      />
    </VisSingleContainer>
  )
}

