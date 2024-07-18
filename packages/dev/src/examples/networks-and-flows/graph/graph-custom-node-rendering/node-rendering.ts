import { select, Selection } from 'd3-selection'
import { getNumber, getColor, getString, GraphConfigInterface, GraphNode, StringAccessor, trimString } from '@unovis/ts'

import identityIcon from './icons/identity-user.svg?raw'
import networkIcon from './icons/network-interface.svg?raw'
import resourceIcon from './icons/resource-file.svg?raw'
import computeIcon from './icons/compute.svg?raw'
import secretIcon from './icons/secret-key.svg?raw'
import starIcon from './icons/star.svg?raw'
import adminIcon from './icons/enrichment-admin.svg?raw'
import highDataAccessIcon from './icons/enrichment-db.svg?raw'

import * as s from './styles'
import { DEFAULT_CIRCLE_LABEL_SIZE, DEFAULT_NODE_SIZE, NODE_STAR_ICON_ID, nodeStatusIconMap } from './constants'
import type { CustomGraphLink, CustomGraphNode } from './types'
import { CustomGraphNodeStatus } from './enums'

export const nodeSvgDefs = `
  ${identityIcon}
  ${networkIcon}
  ${resourceIcon}
  ${computeIcon}
  ${secretIcon}
  ${starIcon}
  ${adminIcon}
  ${highDataAccessIcon}
`

export const nodeEnterCustomRenderFunction = <
  N extends CustomGraphNode,
  L extends CustomGraphLink,
>(
  d: GraphNode<N, L>,
  g: Selection<SVGGElement, GraphNode<N, L>, null, unknown>,
  config: GraphConfigInterface<N, L>
): void => {
  // Node Circle and Icon
  g.append('circle').attr('class', s.nodeSelectionBackground)
  g.append('circle').attr('class', s.nodeHighlightBackground)
  g.append('circle').attr('class', s.nodeCircle)
  g.append('use').attr('class', s.nodeIcon)

  // Node Aggregation
  g.append('rect').attr('class', s.nodeAggregationBackground)
    .classed(s.nodeCircleLabelBackground, true)
  g.append('text').attr('class', s.nodeAggregationText)
    .classed(s.nodeCircleLabelText, true)

  // Node Session Count
  g.append('rect').attr('class', s.nodeSessionCountBackground)
    .classed(s.nodeCircleLabelBackground, true)
  g.append('text').attr('class', s.nodeSessionCountText)
    .classed(s.nodeCircleLabelText, true)

  // Node Watchlist
  g.append('circle').attr('class', s.nodeWatchlistBackground)
    .classed(s.nodeCircleLabelBackground, true)
  g.append('use').attr('class', s.nodeWatchlistIcon)

  // Node Labels
  g.append('text').attr('class', s.nodeLabel)
  g.append('text').attr('class', s.nodeSubLabel)
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
  g.select<SVGCircleElement>(`.${s.nodeSelectionBackground}`)
    .attr('r', nodeSize + 5)
    .style('visibility', () => d._state.selected ? null : 'hidden')

  // Update Node Circle and Icon
  g.select<SVGCircleElement>(`.${s.nodeCircle}`)
    .attr('r', nodeSize)
    .style('fill', nodeColor)

  g.select<SVGUseElement>(`.${s.nodeIcon}`)
    .attr('href', getString(d, config.nodeIcon as StringAccessor<N>, d._index) as string)
    .attr('x', -nodeIconSize / 2)
    .attr('y', -nodeIconSize / 2)
    .attr('width', nodeIconSize)
    .attr('height', nodeIconSize)
    .style('fill', nodeIconColor)

  // Update Node Aggregation Count
  const aggregationPos = [nodeCircleLabelPlacementDistance * Math.cos(Math.PI / 4), -nodeCircleLabelPlacementDistance * Math.sin(Math.PI / 4)]
  const aggregationCountVisibility = (d.aggregationCount ? null : 'hidden') as string
  g.select<SVGTextElement>(`.${s.nodeAggregationText}`)
    .attr('x', aggregationPos[0])
    .attr('y', aggregationPos[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d.aggregationCount ?? '')
    .attr('visibility', aggregationCountVisibility)

  g.select<SVGRectElement>(`.${s.nodeAggregationBackground}`)
    .attr('width', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('rx', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('ry', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('x', aggregationPos[0])
    .attr('y', aggregationPos[1])
    .attr('transform', `translate(${-DEFAULT_CIRCLE_LABEL_SIZE}, ${-DEFAULT_CIRCLE_LABEL_SIZE})`)
    .attr('visibility', aggregationCountVisibility)

  // Update Node Session Count
  const sessionCountPos = [nodeCircleLabelPlacementDistance, 0]
  const numSessionsText = d.numSessions?.toString() ?? ''
  const sessionCountVisibility = (d.numSessions ? null : 'hidden') as string
  const sessionCountBackgroundWidth = Math.max(numSessionsText.length * 7.5, DEFAULT_CIRCLE_LABEL_SIZE * 2)
  g.select<SVGTextElement>(`.${s.nodeSessionCountText}`)
    .attr('x', sessionCountPos[0] + sessionCountBackgroundWidth / 2 - DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('y', sessionCountPos[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d.numSessions ?? '')
    .attr('visibility', sessionCountVisibility)

  g.select<SVGRectElement>(`.${s.nodeSessionCountBackground}`)
    .attr('width', sessionCountBackgroundWidth)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('rx', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('ry', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('x', sessionCountPos[0])
    .attr('y', sessionCountPos[1])
    .attr('transform', `translate(${-DEFAULT_CIRCLE_LABEL_SIZE}, ${-DEFAULT_CIRCLE_LABEL_SIZE})`)
    .attr('visibility', sessionCountVisibility)


  // Update Node Watchlist
  const watchlistPos = [nodeCircleLabelPlacementDistance * Math.cos(-Math.PI / 4), -nodeCircleLabelPlacementDistance * Math.sin(-Math.PI / 4)]
  const watchlistVisibility = (d.starred ? null : 'hidden') as string
  g.select<SVGUseElement>(`.${s.nodeWatchlistIcon}`)
    .attr('href', `#${NODE_STAR_ICON_ID}`)
    .attr('x', watchlistPos[0] - DEFAULT_CIRCLE_LABEL_SIZE / 2)
    .attr('y', watchlistPos[1] - DEFAULT_CIRCLE_LABEL_SIZE / 2)
    .attr('width', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('visibility', watchlistVisibility)

  g.select<SVGCircleElement>(`.${s.nodeWatchlistBackground}`)
    .attr('r', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('cx', watchlistPos[0])
    .attr('cy', watchlistPos[1])
    .attr('visibility', watchlistVisibility)

  // Update Node Findings
  const alertsData = Object.entries(d.numFindings ?? {}).filter(([_, v]) => v > 0)
  const alerts = g.selectAll<SVGGElement, [string, number]>(`.${s.nodeFinding}`).data(alertsData)

  const alertsEnter = alerts.enter().append('g').attr('class', s.nodeFinding)
  alertsEnter.append('circle')
    .attr('class', s.nodeFindingBackground)
    .classed(s.nodeCircleLabelBackground, true)
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
    .attr('class', s.nodeFindingText)
    .classed(s.nodeCircleLabelText, true)

  alertsEnter.merge(alerts)
    .attr('transform', (_, i) => {
      const r = nodeCircleLabelPlacementDistance
      const index = alertsData.length - i - 1
      const angle = -Math.PI / 1.33 - index * 2.66 * Math.atan2(DEFAULT_CIRCLE_LABEL_SIZE, r)
      return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`
    })
    .select('text').text(([, count]) => count)

  // Node Enrichments
  const enrichmentsData = (d.status ?? []) as CustomGraphNodeStatus[]
  const enrichments = g
    .selectAll<SVGGElement, CustomGraphNodeStatus>(`.${s.nodeEnrichment}`).data(enrichmentsData)

  const enrichmentsEnter = enrichments.enter()
    .append('g')
    .attr('class', s.nodeEnrichment)

  enrichmentsEnter.append('circle')
    .attr('class', s.nodeEnrichmentBackground)
    .attr('r', DEFAULT_CIRCLE_LABEL_SIZE)

  enrichmentsEnter.append('use')
    .attr('class', s.nodeEnrichmentIcon)

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
    .attr('href', d => nodeStatusIconMap.get(d) as string)
  enrichments.exit().remove()

  // Node Labels
  const labelPlacementDistance = 1.8 * nodeSize
  const nodeLabel = g.select<SVGTextElement>(`.${s.nodeLabel}`)
    .attr('y', labelPlacementDistance)
    .text(trimString(d.label))

  const nodeSubLabel = g.select<SVGTextElement>(`.${s.nodeSubLabel}`)
    .attr('y', labelPlacementDistance)
    .attr('dy', '1.25em')
    .text(trimString(d.subLabel))

  // Misc
  g.on('mouseenter', () => {
    nodeLabel.text(d.label ?? '')
    nodeSubLabel.text(d.subLabel ?? '')
    g.raise()
  })
    .on('mouseleave', () => {
      nodeLabel.text(trimString(d.label))
      nodeSubLabel.text(trimString(d.subLabel))
    })
}


