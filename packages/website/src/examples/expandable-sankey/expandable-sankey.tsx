import React, { useCallback } from 'react'
import { FitMode, Sankey, SankeyLink, SankeyNode, SankeySubLabelPlacement, VerticalAlign } from '@unovis/ts'
import { VisSingleContainer, VisSankey } from '@unovis/react'

import { getColor, getChildren, LinkDatum, NodeDatum, sankeyData, sourceNode } from './data'

export default function ExpandableSankey (): JSX.Element {
  const [data, setData] = React.useState({
    nodes: [sourceNode, ...getChildren(sourceNode)],
    links: sankeyData.links,
  })

  const toggleGroup = useCallback((n: SankeyNode<NodeDatum, LinkDatum>): void => {
    if (n.expandable) {
      const nodes = [...data.nodes]
      nodes[n.index].expanded = !nodes[n.index].expanded
      n.sourceLinks.forEach(d => {
        nodes[d.index].expanded = false
      })

      setData({
        nodes: n.expanded
          ? nodes.filter(d => !d.id.startsWith(n.id) || d.level <= n.layer)
          : [...nodes, ...getChildren(n)],
        links: data.links,
      })
    }
  }, [data])

  return (
    <VisSingleContainer data={data} height={'60vh'}>
      <VisSankey
        labelFit={FitMode.Wrap}
        labelForceWordBreak={false}
        labelMaxWidth={150}
        labelVerticalAlign={VerticalAlign.Middle}
        nodeColor={useCallback(getColor, [])}
        nodeIcon={useCallback((d: NodeDatum) => d.expandable ? (d.expanded ? '-' : '+') : '', [])}
        nodeCursor={useCallback((d: SankeyNode<NodeDatum, LinkDatum>) => d.expandable ? 'pointer' : null, [])}
        nodePadding={20}
        linkColor={useCallback((d: SankeyLink<NodeDatum, LinkDatum>) => getColor(d.source), [])}
        subLabelPlacement={SankeySubLabelPlacement.Inline}
        subLabel={useCallback((d: SankeyNode<NodeDatum, LinkDatum>) => ((d.depth === 0) || d.expanded)
          ? ''
          : `${((d.value / sourceNode.value) * 100).toFixed(1)}%`
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

