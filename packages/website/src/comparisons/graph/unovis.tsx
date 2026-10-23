import React, { useMemo, useState } from 'react'
import { FitMode, Graph, GraphLayoutType, GraphLinkArrowStyle } from '@unovis/ts'
import { VisSingleContainer, VisGraph, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { GraphData, NodeDatum, LinkDatum, NodeGroup, groups, formatRequests, formatLatency, formatAlerts } from './data'
import { GRAPH_ICON_SYMBOLS, ALERT_COLOR } from './constants'

const groupIndex = (n: NodeDatum): number => groups.findIndex(g => g.key === n.group)
// Compact layouts with room for the two- and three-line labels: the graph zooms in to fit the card, so the nodes come out bigger
const forceLayoutSettings = { linkDistance: 60, charge: -850 }
// Left to right, to use the width of the card
const dagreLayoutSettings = { rankdir: 'LR', nodesep: 8, ranksep: 80 }
const zoomScaleExtent: [number, number] = [0.35, 2]
// A little less padding than the default 50 around the fitted graph, still enough for the labels under the bottom nodes
const fitViewPadding = 40
const tooltipTriggers = {
  [Graph.selectors.node]: (n: NodeDatum) => `
    <b>${n.label}</b><br/>${groups[groupIndex(n)].label}<br/>${formatLatency(n.latency)}${n.alerts ? `<br/>${formatAlerts(n.alerts)}` : ''}
  `,
  [Graph.selectors.link]: (l: { source: NodeDatum; target: NodeDatum; requests: number }) => `
    ${l.source.label} → ${l.target.label}<br/>${formatRequests(l.requests)}
  `,
}

export default function UnovisGraph ({ data, preset }: ChartProps<GraphData>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<NodeGroup, boolean>>>({})
  const toggleGroup = (_: unknown, i: number): void => setHidden({ ...hidden, [groups[i].key]: !hidden[groups[i].key] })
  const legendItems = groups.map(g => ({ name: g.label, inactive: hidden[g.key] }))

  const nodes = useMemo(() => data.nodes.filter(n => !hidden[n.group]), [data, hidden])
  const links = useMemo(() => data.links.filter(l => nodes.some(n => n.id === l.source) && nodes.some(n => n.id === l.target)), [data, nodes])

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleGroup}/>
      <VisSingleContainer data={{ nodes, links }} height={536} svgDefs={GRAPH_ICON_SYMBOLS}>
        <VisGraph
          layoutType={preset === 'layered' ? GraphLayoutType.Dagre : preset === 'circular' ? GraphLayoutType.Circular : GraphLayoutType.Force}
          forceLayoutSettings={forceLayoutSettings}
          dagreLayoutSettings={dagreLayoutSettings}
          disableZoom
          zoomScaleExtent={zoomScaleExtent}
          fitViewPadding={fitViewPadding}
          nodeIcon={(n: NodeDatum) => `#graph-icon-${n.group}`}
          nodeFill={(n: NodeDatum) => `var(--vis-color${groupIndex(n)})`}
          nodeStrokeWidth={0}
          nodeSize={(n: NodeDatum) => preset === 'size' ? 20 + n.latency / 8 : 36}
          nodeLabel={(n: NodeDatum) => n.label}
          nodeLabelFitMode={FitMode.Wrap}
          nodeSubLabel={(n: NodeDatum) => formatLatency(n.latency)}
          nodeSideLabels={(n: NodeDatum) => n.alerts ? [{ text: `${n.alerts}`, color: ALERT_COLOR }] : []}
          linkWidth={(l: LinkDatum) => 1 + l.requests / 250}
          linkCurvature={1}
          linkArrow={GraphLinkArrowStyle.Single}
          linkFlow
        />
        <VisTooltip container={document.body} triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </>
  )
}
