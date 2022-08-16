import { select, Selection } from 'd3-selection'

// Utils
import { getColor } from 'utils/color'
import { getString } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { Spacing } from 'types/spacing'

// Local Types
import { SankeyEnterTransitionType, SankeyExitTransitionType, SankeyInputLink, SankeyInputNode, SankeyNode, SankeyNodeAlign } from '../types'

// Config
import { SankeyConfig } from '../config'

// Helpers
import { renderLabel } from './label'

// Styles
import * as s from '../style'

export function createNodes<N extends SankeyInputNode, L extends SankeyInputLink> (
  sel: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfig<N, L>,
  width: number,
  bleed: Spacing
): void {
  const { enterTransitionType } = config

  // Node
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
    .attr('dy', '0.5px')

  sel
    .attr('transform', d => {
      const x = (enterTransitionType === SankeyEnterTransitionType.FromAncestor && d.targetLinks?.[0]) ? d.targetLinks[0].source.x0 : d.x0
      return `translate(${sel.size() === 1 ? width * 0.5 - bleed.left : x}, ${d.y0})`
    })
    .style('opacity', 0)
}

function getNodeXPos<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfig<N, L>,
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

export function updateNodes<N extends SankeyInputNode, L extends SankeyInputLink> (
  sel: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfig<N, L>,
  width: number,
  bleed: Spacing,
  hasLinks: boolean,
  duration: number
): void {
  smartTransition(sel, duration)
    .attr('transform', d => `translate(${getNodeXPos(d, config, width, bleed, hasLinks)},${d.y0})`)
    .style('opacity', d => d._state.greyout ? 0.2 : 1)

  // Node
  smartTransition(sel.select(`.${s.node}`), duration)
    .attr('width', config.nodeWidth)
    .attr('height', (d: SankeyNode<N, L>) => d.y1 - d.y0)
    .style('cursor', (d: SankeyNode<N, L>) => getString(d, config.nodeCursor))
    .style('fill', (d: SankeyNode<N, L>) => getColor(d, config.nodeColor))

  // Label Rendering
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  renderNodeLabels(sel, config, width, duration)

  // Node Icon
  const nodeIcon = sel.select(`.${s.nodeIcon}`)
  if (config.nodeIcon) {
    nodeIcon
      .attr('visibility', null)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('stroke', (d: SankeyNode<N, L>) => getColor(d, config.nodeIconColor))
      .style('fill', (d: SankeyNode<N, L>) => getColor(d, config.nodeIconColor))
      .style('font-size', (d: SankeyNode<N, L>) => {
        const nodeHeight = d.y1 - d.y0
        return nodeHeight < s.SANKEY_ICON_SIZE ? `${nodeHeight * 0.65}px` : null
      })
      .html(config.nodeIcon)

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
  config: SankeyConfig<N, L>,
  width: number,
  duration: number,
  enforceNodeVisibility?: SankeyNode<N, L>
): void {
  // Label Rendering
  const labelGroupSelection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, any> = sel.select(`.${s.labelGroup}`)
  const labelGroupEls = labelGroupSelection.nodes() || []

  // After rendering Label return a BBox so we can do intersection detection and hide some of tem
  const labelGroupBBoxes = labelGroupEls.map(g => {
    const gSelection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, any> = select(g)
    const datum = gSelection.datum()
    return renderLabel(gSelection, datum, config, width, duration, enforceNodeVisibility === datum)
  })

  if (config.labelVisibility) {
    for (const b of labelGroupBBoxes) {
      const datum = b.selection.datum() as SankeyNode<N, L>
      const box = { x: b.x, y: b.y, width: b.width, height: b.height }
      b.hidden = !config.labelVisibility(datum, box, enforceNodeVisibility === datum)
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
        if (shouldBeHidden) {
          if (b1.selection.datum() === enforceNodeVisibility) b0.hidden = true // If the hovered node should be hidden, hide the previous one instead
          else b1.hidden = true
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
  config: SankeyConfig<N, L>,
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
  nodeSelection: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, unknown>,
  config: SankeyConfig<N, L>,
  width: number
): void {
  const labelGroup = nodeSelection.raise()
    .select<SVGGElement>(`.${s.labelGroup}`)

  if ((config.labelExpandTrimmedOnHover && labelGroup.classed(s.labelTrimmed)) || labelGroup.classed(s.hidden)) {
    renderLabel(labelGroup, d, config, width, 0, true)
  }
  labelGroup.classed(s.forceShow, true)
}

export function onNodeMouseOut<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  nodeSelection,
  config: SankeyConfig<N, L>,
  width: number
): void {
  const labelGroup = nodeSelection.select(`.${s.labelGroup}`)
  if (config.labelExpandTrimmedOnHover || labelGroup.classed(s.hidden)) {
    renderLabel(labelGroup, d, config, width, 0)
  }
  labelGroup.classed(s.forceShow, false)
}
