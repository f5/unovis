import { select, Selection } from 'd3-selection'
import { max } from 'd3-array'

// Utils
import { getColor } from 'utils/color'
import { getString, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { Spacing } from 'types/spacing'

// Local Types
import {
  SankeyEnterTransitionType,
  SankeyExitTransitionType,
  SankeyInputLink,
  SankeyInputNode,
  SankeyNode,
  SankeyNodeAlign,
  SankeySubLabelPlacement,
} from '../types'

// Config
import { SankeyConfigInterface } from '../config'

// Helpers
import { getLabelFontSize, getSubLabelFontSize, renderLabel } from './label'

// Styles
import * as s from '../style'

export const NODE_SELECTION_RECT_DELTA = 3

export function createNodes<N extends SankeyInputNode, L extends SankeyInputLink> (
  sel: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfigInterface<N, L>,
  width: number,
  bleed: Spacing
): void {
  const { enterTransitionType } = config

  // Node
  sel.append('rect')
    .attr('class', s.nodeSelectionRect)
    .attr('width', config.nodeWidth + NODE_SELECTION_RECT_DELTA * 2)
    .attr('height', d => d.y1 - d.y0 + NODE_SELECTION_RECT_DELTA * 2)
    .attr('x', -NODE_SELECTION_RECT_DELTA)
    .attr('y', -NODE_SELECTION_RECT_DELTA)
    .style('stroke', node => getColor(node, config.nodeColor))
    .style('opacity', 0)

  sel.append('rect')
    .attr('class', s.node)
    .attr('width', config.nodeWidth)
    .attr('height', d => d.y1 - d.y0)
    .style('fill', node => getColor(node, config.nodeColor))

  // Labels
  const labelGroup = sel.append('g').attr('class', s.labelGroup)
  labelGroup.append('path').attr('class', s.labelBackground)
  labelGroup.append('text').attr('class', s.label)
  labelGroup.append('text').attr('class', s.sublabel)

  // Node icon
  sel.append('text').attr('class', s.nodeIcon)
    .attr('text-anchor', 'middle')

  sel
    .attr('transform', d => {
      const x = (enterTransitionType === SankeyEnterTransitionType.FromAncestor && d.targetLinks?.[0]) ? d.targetLinks[0].source.x0 : d.x0
      return `translate(${sel.size() === 1 ? width * 0.5 - bleed.left : x}, ${d.y0})`
    })
    .style('opacity', 0)
}

function getNodeXPos<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfigInterface<N, L>,
  width: number,
  bleed: Spacing,
  hasLinks: boolean
): number {
  if (hasLinks) return d.x0

  switch (config.nodeAlign) {
    case SankeyNodeAlign.Left: return d.x0
    case SankeyNodeAlign.Right: return width - bleed.right
    case SankeyNodeAlign.Center:
    case SankeyNodeAlign.Justify:
    default: return width * 0.5 - bleed.left
  }
}

function getXDistanceToNextNode<N extends SankeyInputNode, L extends SankeyInputLink> (
  sel: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  datum: SankeyNode<N, L>,
  data: SankeyNode<N, L>[], // Assuming that the nodes are sorted by the x position for performance reasons
  config: SankeyConfigInterface<N, L>,
  width: number
): number {
  let yTolerance = config.labelMaxWidthTakeAvailableSpaceTolerance
  if (!isNumber(yTolerance)) {
    const labelFontSize = getLabelFontSize(config, sel.node())
    const subLabelFontSize = getSubLabelFontSize(config, sel.node())
    const hasSecondLineSublabel = getString(datum, config.subLabel) && config.subLabelPlacement !== SankeySubLabelPlacement.Inline
    yTolerance = (labelFontSize + subLabelFontSize) / (hasSecondLineSublabel ? 2 : 4)
  }

  // Assuming that the nodes are sorted by the x position
  const nodeOnTheRight = data.find(d =>
    d.layer > datum.layer &&
      d.x0 >= datum.x1 &&
      d.y1 >= (datum.y0 - yTolerance) &&
      d.y0 <= (datum.y1 + yTolerance)
  )

  return (nodeOnTheRight ? nodeOnTheRight.x0 : width) - datum.x1
}

export function updateNodes<N extends SankeyInputNode, L extends SankeyInputLink> (
  sel: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfigInterface<N, L>,
  width: number,
  bleed: Spacing,
  hasLinks: boolean,
  duration: number,
  layerSpacing: number
): void {
  smartTransition(sel, duration)
    .attr('transform', d => `translate(${getNodeXPos(d, config, width, bleed, hasLinks)},${d.y0})`)
    .style('opacity', d => d._state.greyout ? 0.2 : 1)

  // Node
  smartTransition(sel.select(`.${s.nodeSelectionRect}`), duration)
    .attr('width', config.nodeWidth + NODE_SELECTION_RECT_DELTA * 2)
    .attr('height', d => d.y1 - d.y0 + NODE_SELECTION_RECT_DELTA * 2)
    .attr('x', -NODE_SELECTION_RECT_DELTA)
    .attr('y', -NODE_SELECTION_RECT_DELTA)
    .style('stroke', (d: SankeyNode<N, L>) => getColor(d, config.nodeColor))
    .style('opacity', d => config.selectedNodeIds?.includes(d.id) ? 1 : 0)

  smartTransition(sel.select(`.${s.node}`), duration)
    .attr('width', config.nodeWidth)
    .attr('height', (d: SankeyNode<N, L>) => d.y1 - d.y0)
    .style('cursor', (d: SankeyNode<N, L>) => getString(d, config.nodeCursor))
    .style('fill', (d: SankeyNode<N, L>) => getColor(d, config.nodeColor))

  // Label Rendering
  const maxLayer = max(sel.data(), d => d.layer)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  renderNodeLabels(sel, config, width, duration, layerSpacing, maxLayer, bleed)

  // Node Icon
  const nodeIcon = sel.select(`.${s.nodeIcon}`)
  if (config.nodeIcon) {
    nodeIcon.each((d, i, els) => {
      const el = select(els[i])
      const nodeHeight = d.y1 - d.y0
      const color = getColor(d, config.nodeIconColor)
      const visibility = nodeHeight > 2 ? null : 'hidden'
      const fontSize = nodeHeight < s.SANKEY_ICON_SIZE ? `${nodeHeight * 0.65}px` : null

      el
        .attr('visibility', visibility)
        .style('stroke', color)
        .style('fill', color)
        .style('font-size', fontSize)
        .html(getString(d, config.nodeIcon))
    })

    smartTransition(nodeIcon, duration)
      .attr('x', config.nodeWidth / 2)
      .attr('y', (d: SankeyNode<N, L>) => (d.y1 - d.y0) / 2)
  } else {
    nodeIcon
      .attr('visibility', 'hidden')
  }
}

export function renderNodeLabels<N extends SankeyInputNode, L extends SankeyInputLink> (
  sel: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfigInterface<N, L>,
  width: number,
  duration: number,
  layerSpacing: number,
  sankeyMaxLayer: number,
  bleed: Spacing
): void {
  // Label Rendering
  const labelGroupSelection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown> = sel.select(`.${s.labelGroup}`)
  const labelGroupEls = labelGroupSelection.nodes() || []

  // After rendering Label return a BBox so we can do intersection detection and hide some of them
  const data = sel.data()
  const labelGroupBBoxes = labelGroupEls.map(g => {
    const gSelection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown> = select(g)
    const datum = gSelection.datum()
    const spacing = config.labelMaxWidthTakeAvailableSpace
      ? getXDistanceToNextNode(gSelection, datum, data, config, width)
      : layerSpacing

    return renderLabel(gSelection, datum, config, width, duration, spacing, sankeyMaxLayer, bleed)
  })

  if (config.labelVisibility) {
    for (const b of labelGroupBBoxes) {
      const datum = b.selection.datum() as SankeyNode<N, L>
      const box = { x: b.x, y: b.y, width: b.width, height: b.height }
      b.hidden = !config.labelVisibility(datum, box, false)
    }
  } else {
    // Detect intersecting labels
    const maxLayer = Math.max(...labelGroupBBoxes.map(b => b.layer))
    for (let layer = 0; layer <= maxLayer; layer += 1) {
      const boxes = labelGroupBBoxes.filter(b => (b.layer === layer))
      boxes.sort((a, b) => a.y - b.y)

      let lastVisibleIdx = 0
      for (let i = 1; i < boxes.length; i += 1) {
        const b0 = boxes[lastVisibleIdx]
        const b1 = boxes[i]

        const shouldBeHidden = b1.y < (b0.y + b0.height)
        const b1Datum = b1.selection.datum() as SankeyNode<N, L>
        if (shouldBeHidden) {
          if (config.selectedNodeIds?.includes(b1Datum.id)) {
            b0.hidden = true // If the hovered node should be hidden, hide the previous one instead
          } else b1.hidden = true
        }

        if (!b1.hidden) lastVisibleIdx = i
      }
    }
  }

  // Hide intersecting labels
  for (const b of labelGroupBBoxes) {
    b.selection.classed(s.hidden, b.hidden)
  }
}

export function removeNodes<N extends SankeyInputNode, L extends SankeyInputLink> (
  selection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfigInterface<N, L>,
  duration: number
): void {
  const { exitTransitionType } = config

  selection.each((d, i, els) => {
    const node = select(els[i])
    const transition = smartTransition(node, duration)
    if ((exitTransitionType === SankeyExitTransitionType.ToAncestor) && d.targetLinks?.[0]) {
      transition.attr('transform', `translate(${d.targetLinks[0].source.x0},${d.y0})`)
    }

    transition
      .style('opacity', 0)
      .remove()
  })
}

export function onNodeMouseOver<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  data: SankeyNode<N, L>[],
  nodeSelection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfigInterface<N, L>,
  width: number,
  layerSpacing: number,
  bleed: Spacing
): void {
  const labelGroup = nodeSelection.raise()
    .select<SVGGElement>(`.${s.labelGroup}`)

  const spacing = config.labelMaxWidthTakeAvailableSpace
    ? getXDistanceToNextNode(nodeSelection, d, data, config, width)
    : layerSpacing

  const maxLayer = max(data, d => d.layer)
  if ((config.labelExpandTrimmedOnHover && labelGroup.classed(s.labelTrimmed)) || labelGroup.classed(s.hidden)) {
    renderLabel(labelGroup, d, config, width, 0, spacing, maxLayer, bleed, true)
  }
  labelGroup.classed(s.forceShow, true)
}

export function onNodeMouseOut<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  data: SankeyNode<N, L>[],
  nodeSelection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfigInterface<N, L>,
  width: number,
  layerSpacing: number,
  bleed: Spacing
): void {
  const labelGroup = nodeSelection.select<SVGGElement>(`.${s.labelGroup}`)

  const spacing = config.labelMaxWidthTakeAvailableSpace
    ? getXDistanceToNextNode(nodeSelection, d, data, config, width)
    : layerSpacing

  if (config.labelExpandTrimmedOnHover || labelGroup.classed(s.hidden)) {
    const maxLayer = max(data, d => d.layer)
    renderLabel(labelGroup, d, config, width, 0, spacing, maxLayer, bleed, false)
  }
  labelGroup.classed(s.forceShow, false)
}
