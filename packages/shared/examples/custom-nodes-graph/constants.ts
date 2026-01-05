import type { Selection } from 'd3-selection'
import { css } from '@emotion/css'
import { group, max, mean, min } from 'd3-array'
import { getNumber, getColor, getString, getTransformValues, Graph, trimString } from '@unovis/ts'
import type { GraphConfigInterface, GraphNode, StringAccessor } from '@unovis/ts'
import {
  DEFAULT_CIRCLE_LABEL_SIZE,
  DEFAULT_NODE_SIZE,
  CustomGraphNodeStatus,
  CustomGraphLink,
  CustomGraphNode,
  CustomGraphSwimlane,
  NODE_STAR_ICON_ID,
} from './data'


export const customNodesGraph = css`
  label: custom-nodes-graph;
  --unovis-background-primary: #ffffff;
  --unovis-background-secondary: #fbfbfb;
  --unovis-text-primary: #222;
  --unovis-text-secondary: #666;

  --unovis-graph-node-identity: color-mix(in srgb, var(--vis-color0) 70%, transparent);
  --unovis-graph-node-network: color-mix(in srgb, var(--vis-color1) 70%, transparent);
  --unovis-graph-node-resource: color-mix(in srgb, var(--vis-color2) 70%, transparent);
  --unovis-graph-node-compute: color-mix(in srgb, var(--vis-color3) 70%, transparent);
  --unovis-graph-node-secret: color-mix(in srgb, var(--vis-color4) 70%, transparent);
  --unovis-graph-node-finding: color-mix(in srgb, var(--vis-color5) 70%, transparent);
  --unovis-graph-node-threat-actor: #AE2A3F;

  --unovis-graph-font: "Noto Sans Mono", monospace;
  --unovis-graph-circle-label-font-size: 8px;
  --unovis-graph-circle-label-font-weight: 600;
  --unovis-graph-circle-label-fill: #fff;
  --unovis-graph-circle-label-background-fill: #52525A;
  --unovis-graph-circle-label-background-stroke: #fff;
  --unovis-graph-enrichment-background-fill: #fff;

  --unovis-graph-node-label-font-size: 9px;
  --unovis-graph-node-label-color: var(--unovis-text-primary);
  --unovis-graph-node-sublabel-font-size: 8px;
  --unovis-graph-node-sublabel-color: var(--unovis-text-secondary);
  --unovis-graph-swimlane-label-font-size: 9pt;
  --unovis-graph-swimlane-label-text-color: var(--unovis-text-secondary);

  --unovis-severity-critical: #ae2a3f;
  --unovis-severity-high: #e14f62;
  --unovis-severity-medium: #d9622b;
  --unovis-severity-low: #e2b53e;

  [clickable="true"] {
    cursor: pointer;
  }

  /* Dark theme overrides */
  body.theme-dark & {
    --unovis-background-primary: #1a1a1a;
    --unovis-background-secondary: #2d2d2d;
    --unovis-text-primary: #ffffff;
    --unovis-text-secondary: #b3b3b3;

    --unovis-graph-circle-label-fill: #000;
    --unovis-graph-circle-label-background-fill: #e5e5e5;
    --unovis-graph-circle-label-background-stroke: #1a1a1a;
    --unovis-graph-enrichment-background-fill: #2d2d2d;

    --unovis-severity-critical: #ff6b7a;
    --unovis-severity-high: #ff8a9b;
    --unovis-severity-medium: #ffb366;
    --unovis-severity-low: #ffd966;
  }
`
// Node Appearance
export const node = css`label: node-group;`
export const nodeCircle = css`label: node-background;`
export const nodeIcon = css`label: node-icon; pointer-events: none;`
export const nodeSelectionBackground = css`
  label: node-selection-background;
  fill: none;
  stroke: var(--unovis-text-secondary);
  stroke-dasharray: 4 4;
`
export const nodeHighlightBackground = css`label: node-highlight-background;`

// Node Aggregation
export const nodeAggregationBackground = css`label: node-aggregation-background;`
export const nodeAggregationText = css`label: node-aggregation-text;`

// Watchlist
export const nodeWatchlistBackground = css`label: node-watchlist-background;`
export const nodeWatchlistIcon = css`label: node-watchlist-icon;`

// Session Count
export const nodeSessionCountBackground = css`label: node-session-count-background;`
export const nodeSessionCountText = css`label: node-session-count-text;`

// Findings
export const nodeFinding = css`label: node-finding;`
export const nodeFindingBackground = css`label: node-finding-background;`
export const nodeFindingText = css`label: node-finding-text;`

// Enrichment
export const nodeEnrichments = css`label: node-enrichments;`
export const nodeEnrichment = css`label: node-enrichment;`
export const nodeEnrichmentBackground = css`
  label: node-enrichment-background;
  fill: var(--unovis-graph-enrichment-background-fill);
`
export const nodeEnrichmentIcon = css`label: node-enrichment-icon;`

// Node Labels
export const nodeLabel = css`
  label: node-label;
  text-anchor: middle;
  font-size: var(--unovis-graph-node-label-font-size);
  fill: var(--unovis-graph-node-label-color);
`
export const nodeSubLabel = css`
  label: node-sub-label;
  text-anchor: middle;
  font-size: var(--unovis-graph-node-sublabel-font-size);
  fill: var(--unovis-graph-node-sublabel-color);
`

// Circle Label Styles
export const nodeCircleLabelBackground = css`
  label: node-circle-label-background;
  fill: var(--unovis-graph-circle-label-background-fill);
  stroke: var(--unovis-graph-circle-label-background-stroke);
  stroke-width: 2;
`

export const nodeCircleLabelText = css`
  label: node-circle-label-text;
  font-family: var(--unovis-graph-font);
  font-size: var(--unovis-graph-circle-label-font-size);
  font-weight: var(--unovis-graph-circle-label-font-weight);
  fill: var(--unovis-graph-circle-label-fill);
  text-anchor: middle;
`

// Swimlanes
export const swimlaneRect = css`label: swimlane-rect;`
export const swimlaneLabel = css`label: swimlane-label;`
export const swimlaneLabelBackground = css`label: swimlane-label-background;`
export const swimlaneLabelText = css`
  label: swimlane-label-text;
  font-size: var(--unovis-graph-swimlane-label-font-size);
  font-weight: var(--unovis-graph-swimlane-label-font-weight);
  fill: var(--unovis-graph-swimlane-label-text-color);
  text-anchor: middle;
`

export const globalControlsContainer = css`
  label: global-controls-container;
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
  top: 10px;
  left: 10px;
  background: white;
  gap: 8px;
  padding: 5px;
  border-radius: 4px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  /* Dark theme overrides */
  body.theme-dark & {
    background: #2d2d2d;
    color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`

export const graphButton = css`
  label: graph-button;
  display: block;
  margin-top: 5px;
`

export const updateSwimlanes = (g: Selection<SVGGElement, unknown, null, undefined>): void => {
  const svgGraph = g.select(`.${Graph.selectors.graphGroup}`)
  const transform = getTransformValues(svgGraph.node() as SVGElement)

  g.selectAll<SVGGElement, CustomGraphSwimlane>(`.${swimlaneRect}`)
    .attr('transform', `translate(${transform.translate.x}, 0) scale(${transform.scale.x}, 1)`)

  g.selectAll<SVGGElement, CustomGraphSwimlane>(`.${swimlaneLabel}`)
    .attr('transform', `translate(${transform.translate.x}, 0) scale(${transform.scale.x}, 1)`)

  g.selectAll<SVGTextElement, CustomGraphSwimlane>(`.${swimlaneLabelText}`)
    .attr('transform', lane => `scale(${1 / transform.scale.x}, 1) translate(${lane.xCenter * transform.scale.x}, 0)`)

  g.selectAll<SVGRectElement, CustomGraphSwimlane>(`.${swimlaneLabelBackground}`)
    .attr('transform', lane => `scale(${1 / transform.scale.x}, 1) translate(${lane.xCenter * transform.scale.x}, 0)`)
}

export const renderSwimlanes = (
  g: Selection<SVGGElement, unknown, null, undefined>,
  nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
): void => {
  const nodesGrouped = group(nodes, d => d.type)
  const largeSvgNumber = 9999
  const swimlanes = Array.from(nodesGrouped.entries()).map(([key, nodes], i) => ({
    index: i,
    label: key,
    xCenter: mean(nodes, (d: GraphNode<CustomGraphNode, CustomGraphLink>) => d.x) as number,
    xMin: min(nodes, (d: GraphNode<CustomGraphNode, CustomGraphLink>) => d.x) as number,
    xMax: max(nodes, (d: GraphNode<CustomGraphNode, CustomGraphLink>) => d.x) as number,
    x1: 0,
    x2: 0,
  })) as CustomGraphSwimlane[]

  for (const [index, lane] of swimlanes.entries()) {
    const i = swimlanes.length === 1 ? -1 : index
    switch (i) {
      case -1:
        lane.x1 = -largeSvgNumber
        lane.x2 = largeSvgNumber
        break
      case 0:
        lane.x1 = -largeSvgNumber
        lane.x2 = (lane.xMax + swimlanes[i + 1].xMin) / 2
        break
      case swimlanes.length - 1:
        lane.x1 = (lane.xMin + swimlanes[i - 1].xMax) / 2
        lane.x2 = largeSvgNumber
        break
      default:
        lane.x1 = (lane.xMin + swimlanes[i - 1].xMax) / 2
        lane.x2 = (lane.xMax + swimlanes[i + 1].xMin) / 2
        lane.xCenter = (lane.x1 + lane.x2) / 2
        break
    }
  }

  // Rendering
  // Rects in the background
  const svgSwimlaneRects = g.selectAll<SVGRectElement, CustomGraphSwimlane>(`.${swimlaneRect}`)
    .data(swimlanes)

  const svgSwimlanesRectsEnter = svgSwimlaneRects.enter()
    .insert('rect', ':first-child')
    .attr('class', swimlaneRect)
    .style('opacity', 0);

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlanesRectsEnter as any).transition()
    .style('opacity', 1)

  const svgSwimlanesRectsMerged = svgSwimlaneRects.merge(svgSwimlanesRectsEnter)
  svgSwimlanesRectsMerged
    .attr('x', lane => lane.x1)
    .attr('width', lane => lane.x2 - lane.x1)
    .attr('y', -largeSvgNumber)
    .attr('height', largeSvgNumber * 2)
    .style('fill', lane => lane.index % 2 ? 'var(--unovis-background-primary)' : 'var(--unovis-background-secondary)');

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlaneRects.exit() as any)
    .transition()
    .style('opacity', 0)
    .remove()

  // Labels in the foreground
  const svgSwimlaneLabels = g.selectAll<SVGGElement, CustomGraphSwimlane>(`.${swimlaneLabel}`)
    .data(swimlanes)

  const svgSwimlaneLabelsEnter = svgSwimlaneLabels.enter()
    .append('g')
    .attr('class', swimlaneLabel)
    .style('opacity', 0);

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlaneLabelsEnter as any).transition()
    .style('opacity', 1)

  svgSwimlaneLabelsEnter
    .append('rect')
    .attr('class', swimlaneRect)

  svgSwimlaneLabelsEnter.append('rect')
    .attr('class', swimlaneLabelBackground)

  svgSwimlaneLabelsEnter.append('text')
    .attr('class', swimlaneLabelText);

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlaneLabels.exit() as any)
    .transition()
    .style('opacity', 0)
    .remove()

  const svgSwimlaneLabelsMerged = svgSwimlaneLabels.merge(svgSwimlaneLabelsEnter)
  svgSwimlaneLabelsMerged.selectAll<SVGRectElement, CustomGraphSwimlane>(`.${swimlaneLabelBackground}`)
    .data(lane => [lane])
    .attr('y', '94.1%')
    .attr('height', '4%')
    .attr('rx', 8)
    .attr('ry', 8)
    .style('fill', lane => (lane.index) % 2 ? 'var(--unovis-background-primary)' : 'var(--unovis-background-secondary)')

  svgSwimlaneLabelsMerged.selectAll<SVGTextElement, CustomGraphSwimlane>(`.${swimlaneLabelText}`)
    .data(lane => [lane])
    .text(lane => lane.label)
    .attr('y', '97%')

  // Set the background size
  const labelPadding = 5
  svgSwimlaneLabelsMerged.each((_, i, nodes) => {
    const text = nodes[i].querySelector(`.${swimlaneLabelText}`) as SVGTextElement
    const label = nodes[i].querySelector(`.${swimlaneLabelBackground}`) as SVGRectElement
    const textBBox = text.getBBox()
    label.setAttribute('x', `${textBBox.x - labelPadding}`)
    label.setAttribute('width', `${textBBox.width + labelPadding * 2}`)
  })

  updateSwimlanes(g)
}

export const nodeEnterCustomRenderFunction = <
  N extends CustomGraphNode,
  L extends CustomGraphLink,
>(
  d: GraphNode<N, L>,
  g: Selection<SVGGElement, GraphNode<N, L>, null, unknown>
): void => {
  // Node Circle and Icon
  g.append('circle').attr('class', nodeSelectionBackground)
  g.append('circle').attr('class', nodeHighlightBackground)
  g.append('circle').attr('class', nodeCircle)
  g.append('use').attr('class', nodeIcon)

  // Node Aggregation
  g.append('rect').attr('class', nodeAggregationBackground)
    .classed(nodeCircleLabelBackground, true)
  g.append('text').attr('class', nodeAggregationText)
    .classed(nodeCircleLabelText, true)

  // Node Session Count
  g.append('rect').attr('class', nodeSessionCountBackground)
    .classed(nodeCircleLabelBackground, true)
  g.append('text').attr('class', nodeSessionCountText)
    .classed(nodeCircleLabelText, true)

  // Node Watchlist
  g.append('circle').attr('class', nodeWatchlistBackground)
    .classed(nodeCircleLabelBackground, true)
  g.append('use').attr('class', nodeWatchlistIcon)

  // Node Labels
  g.append('text').attr('class', nodeLabel)
  g.append('text').attr('class', nodeSubLabel)
}

export const nodeUpdateCustomRenderFunction = <
  N extends CustomGraphNode,
  L extends CustomGraphLink,
>(
  d: GraphNode<N, L>,
  g: Selection<SVGGElement, GraphNode<N, L>, null, unknown>,
  config: GraphConfigInterface<N, L>
): void => {
  const nodeSize = getNumber(d, config.nodeSize, d._index) ?? DEFAULT_NODE_SIZE
  const nodeIconSize = getNumber(d, config.nodeIconSize, d._index) ?? 2.5 * Math.sqrt(nodeSize)
  const nodeIconColor = getColor(d, config.nodeFill, d._index) ?? 'black'
  const nodeCircleLabelPlacementDistance = 1.15 * nodeSize
  const nodeColor = getColor(d, config.nodeFill, d._index) as string

  // Update Node Selection
  g.select<SVGCircleElement>(`.${nodeSelectionBackground}`)
    .attr('r', nodeSize + 5)
    .style('visibility', () => d._state.selected ? null : 'hidden')

  // Update Node Circle and Icon
  g.select<SVGCircleElement>(`.${nodeCircle}`)
    .attr('r', nodeSize)
    .style('fill', nodeColor)

  g.select<SVGUseElement>(`.${nodeIcon}`)
    .attr('href', getString(d, config.nodeIcon as StringAccessor<N>, d._index) as string)
    .attr('x', -nodeIconSize / 2)
    .attr('y', -nodeIconSize / 2)
    .attr('width', nodeIconSize)
    .attr('height', nodeIconSize)
    .style('fill', nodeIconColor)

  // Update Node Aggregation Count
  const aggregationPos = [nodeCircleLabelPlacementDistance * Math.cos(Math.PI / 4), -nodeCircleLabelPlacementDistance * Math.sin(Math.PI / 4)]
  const aggregationCountVisibility = (d.aggregationCount ? null : 'hidden') as string
  g.select<SVGTextElement>(`.${nodeAggregationText}`)
    .attr('x', aggregationPos[0])
    .attr('y', aggregationPos[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d.aggregationCount ?? '')
    .attr('visibility', aggregationCountVisibility)

  g.select<SVGRectElement>(`.${nodeAggregationBackground}`)
    .attr('width', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('rx', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('ry', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('x', aggregationPos[0])
    .attr('y', aggregationPos[1])
    .attr('transform', `translate(${-DEFAULT_CIRCLE_LABEL_SIZE}, ${-DEFAULT_CIRCLE_LABEL_SIZE})`)
    .attr('visibility', aggregationCountVisibility)

  const sessionCountPos = [nodeCircleLabelPlacementDistance, 0]
  const numSessionsText = d.numSessions?.toString() ?? ''
  const sessionCountVisibility = (d.numSessions ? null : 'hidden') as string
  const sessionCountBackgroundWidth = Math.max(numSessionsText.length * 7.5, DEFAULT_CIRCLE_LABEL_SIZE * 2)
  g.select<SVGTextElement>(`.${nodeSessionCountText}`)
    .attr('x', sessionCountPos[0] + sessionCountBackgroundWidth / 2 - DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('y', sessionCountPos[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d.numSessions ?? '')
    .attr('visibility', sessionCountVisibility)

  g.select<SVGRectElement>(`.${nodeSessionCountBackground}`)
    .attr('width', sessionCountBackgroundWidth)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('rx', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('ry', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('x', sessionCountPos[0])
    .attr('y', sessionCountPos[1])
    .attr('transform', `translate(${-DEFAULT_CIRCLE_LABEL_SIZE}, ${-DEFAULT_CIRCLE_LABEL_SIZE})`)
    .attr('visibility', sessionCountVisibility)

  const watchlistPos = [nodeCircleLabelPlacementDistance * Math.cos(-Math.PI / 4), -nodeCircleLabelPlacementDistance * Math.sin(-Math.PI / 4)]
  const watchlistVisibility = (d.starred ? null : 'hidden') as string
  g.select<SVGUseElement>(`.${nodeWatchlistIcon}`)
    .attr('href', `#${NODE_STAR_ICON_ID}`)
    .attr('x', watchlistPos[0] - DEFAULT_CIRCLE_LABEL_SIZE / 2)
    .attr('y', watchlistPos[1] - DEFAULT_CIRCLE_LABEL_SIZE / 2)
    .attr('width', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('visibility', watchlistVisibility)

  g.select<SVGCircleElement>(`.${nodeWatchlistBackground}`)
    .attr('r', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('cx', watchlistPos[0])
    .attr('cy', watchlistPos[1])
    .attr('visibility', watchlistVisibility)

  const alertsData = Object.entries(d.numFindings ?? {}).filter(([_, v]) => v > 0)
  const alerts = g.selectAll<SVGGElement, [string, number]>(`.${nodeFinding}`).data(alertsData)

  const alertsEnter = alerts.enter().append('g').attr('class', nodeFinding)
  alertsEnter.append('circle')
    .attr('class', nodeFindingBackground)
    .classed(nodeCircleLabelBackground, true)
    .attr('r', DEFAULT_CIRCLE_LABEL_SIZE)
    .style('fill', ([severity]) => {
      switch (severity) {
        case 'low': return 'var(--unovis-severity-low)'
        case 'medium': return 'var(--unovis-severity-medium)'
        case 'high': return 'var(--unovis-severity-high)'
        case 'critical': return 'var(--unovis-severity-critical)'
        default: return 'black'
      }
    })

  alertsEnter
    .append('text')
    .attr('dy', '0.35em')
    .attr('class', nodeFindingText)
    .classed(nodeCircleLabelText, true)

  alertsEnter.merge(alerts)
    .attr('transform', (_, i) => {
      const r = nodeCircleLabelPlacementDistance
      const index = alertsData.length - i - 1
      const angle = -Math.PI / 1.33 - index * 2.66 * Math.atan2(DEFAULT_CIRCLE_LABEL_SIZE, r)
      return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`
    })
    .select('text').text(([, count]) => count)

  const enrichmentsData = (d.status ?? []) as CustomGraphNodeStatus[]
  const enrichments = g
    .selectAll<SVGGElement, CustomGraphNodeStatus>(`.${nodeEnrichment}`).data(enrichmentsData)

  const enrichmentsEnter = enrichments.enter()
    .append('g')
    .attr('class', nodeEnrichment)

  enrichmentsEnter.append('circle')
    .attr('class', nodeEnrichmentBackground)
    .attr('r', DEFAULT_CIRCLE_LABEL_SIZE)

  enrichmentsEnter.append('use')
    .attr('class', nodeEnrichmentIcon)

  const enrichmentsUpdate = enrichmentsEnter.merge(enrichments)
  enrichmentsUpdate
    .attr('transform', (_, i) => {
      const r = nodeSize * 1.75
      const dx = -(enrichmentsData.length - 1) * DEFAULT_CIRCLE_LABEL_SIZE + i * 2 * DEFAULT_CIRCLE_LABEL_SIZE
      return `translate(${dx}, ${-r})`
    })

  const enrichmentIconSize = 1.5 * DEFAULT_CIRCLE_LABEL_SIZE
  enrichmentsUpdate.select('use')
    .attr('x', -enrichmentIconSize / 2)
    .attr('y', -enrichmentIconSize / 2)
    .attr('width', enrichmentIconSize)
    .attr('height', enrichmentIconSize)
  enrichments.exit().remove()

  const labelPlacementDistance = 1.8 * nodeSize
  const nodeLabelElement = g.select<SVGTextElement>(`.${nodeLabel}`)
    .attr('y', labelPlacementDistance)
    .text(trimString(d.label))

  const nodeSubLabelElement = g.select<SVGTextElement>(`.${nodeSubLabel}`)
    .attr('y', labelPlacementDistance)
    .attr('dy', '1.25em')
    .text(trimString(d.subLabel))

  g.on('mouseenter', () => {
    nodeLabelElement.text(d.label ?? '')
    nodeSubLabelElement.text(d.subLabel ?? '')
    g.raise()
  })
    .on('mouseleave', () => {
      nodeLabelElement.text(trimString(d.label))
      nodeSubLabelElement.text(trimString(d.subLabel))
    })
}


