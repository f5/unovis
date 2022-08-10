import React, { useCallback } from 'react'
import { FitMode, Sankey, SankeyNode, SankeySubLabelPlacement, VerticalAlign } from '@volterra/vis'
import { VisSingleContainer, VisSankey } from '@volterra/vis-react'

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
    <VisSingleContainer data={data} height={700}>
      <VisSankey
        labelFit={FitMode.Wrap}
        labelForceWordBreak={false}
        labelMaxWidth={150}
        labelVerticalAlign={VerticalAlign.Middle}
        nodeColor={useCallback(getColor, [])}
        nodeIcon={useCallback((d: NodeDatum) => d.expandable ? (d.expanded ? '-' : '+') : '', [])}
        nodeCursor='pointer'
        nodePadding={20}
        linkColor={useCallback((d: LinkDatum) => getColor(d.source), [])}
        subLabelPlacement={SankeySubLabelPlacement.Inline}
        subLabel={useCallback((d: NodeDatum) => d.expanded
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

