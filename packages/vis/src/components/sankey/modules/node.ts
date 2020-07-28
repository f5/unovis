// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Utils
import { getColor } from 'utils/color'
import { getValue } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { Spacing } from 'types/misc'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface } from 'types/sankey'
import { ExitTransitionType, EnterTransitionType } from 'types/animation'
import { Position } from 'types/position'

// Config
import { SankeyConfig } from '../config'

// Helpers
import { renderLabel } from './label'

// Styles
import * as s from '../style'

export function createNodes<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, bleed: Spacing): void {
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
      const x = (enterTransitionType === EnterTransitionType.FROM_ANCESTOR && d.targetLinks?.[0]) ? d.targetLinks[0].source.x0 : d.x0
      return `translate(${sel.size() === 1 ? config.width * 0.5 - bleed.left : x}, ${d.y0})`
    })
    .style('opacity', 0)
}

export function updateNodes<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, bleed: Spacing, duration: number): void {
  smartTransition(sel, duration)
    .attr('transform', d => `translate(${
      (sel.size() === 1 && config.singleNodePosition === Position.CENTER) ? config.width * 0.5 - bleed.left : d.x0
    },${d.y0})`)
    .style('opacity', (d: N) => d._state.greyout ? 0.2 : 1)

  // Node
  smartTransition(sel.select(`.${s.node}`), duration)
    .attr('width', config.nodeWidth)
    .attr('height', d => d.y1 - d.y0)
    .style('cursor', d => getValue(d, config.nodeCursor))

  // Label Rendering
  const labelGroupSelection = sel.select(`.${s.labelGroup}`)
  const labelGroupEls = labelGroupSelection.nodes() || []

  // After rendering Label return a BBox so we can do intersectio detection and hide some of tem
  const labelGroupBBoxes = labelGroupEls.map(g => {
    const gSelection = select(g)
    return renderLabel(gSelection, gSelection.datum(), config, duration)
  })

  if (config.labelVisibility) {
    for (const b of labelGroupBBoxes) {
      const datum = b.selection.datum()
      const box = { x: b.x, y: b.y, width: b.width, height: b.height }
      b.hidden = !config.labelVisibility(datum, box)
    }
  } else {
    // Detect intersecting labels
    const maxLayer = Math.max(...labelGroupBBoxes.map(b => b.layer))
    const numIteration = 3
    for (let iteration = 0; iteration < numIteration; iteration += 1) {
      for (let layer = 0; layer <= maxLayer; layer += 1) {
        const boxes = labelGroupBBoxes.filter(b => (b.layer === layer) && !b.hidden)
        boxes.sort((a, b) => a.y - b.y)

        for (let i = 1; i < boxes.length; i += 1) {
          const b0 = boxes[i - 1]
          const b1 = boxes[i]
          if (b0.hidden) continue

          b1.hidden = b1.y < (b0.y + b0.height)
        }
      }
    }
  }

  // Hide intersecting labels
  for (const b of labelGroupBBoxes) {
    b.selection.classed(s.hidden, b.hidden)
  }

  // Node Icon
  const nodeIcon = sel.select(`.${s.nodeIcon}`)
  if (config.nodeIcon) {
    nodeIcon
      .attr('visibility', null)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('stroke', node => getColor(node, config.iconColor))
      .style('fill', node => getColor(node, config.iconColor))
      .style('font-size', node => {
        const nodeHeight = node.y1 - node.y0
        return nodeHeight < s.SANKEY_ICON_SIZE ? `${nodeHeight * 0.65}px` : null
      })
      .html(config.nodeIcon)

    smartTransition(nodeIcon, duration)
      .attr('x', config.nodeWidth / 2)
      .attr('y', d => (d.y1 - d.y0) / 2)
  } else {
    nodeIcon
      .attr('visibility', 'hidden')
  }
}

export function removeNodes (selection, config, duration): void {
  const { exitTransitionType } = config
  const transitionSelection = smartTransition(selection, duration)
  if (exitTransitionType === ExitTransitionType.TO_ANCESTOR) {
    transitionSelection.attr('transform', d => {
      if (d.targetLinks?.[0]) {
        return `translate(${d.targetLinks[0].source.x0},${d.y0})`
      } else return null
    })
  }

  transitionSelection
    .style('opacity', 0)
    .remove()
}

export function onNodeMouseOver<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, sel, config: SankeyConfig<N, L>): void {
  sel.raise()
    .select(`.${s.labelGroup}`)
    .classed(s.forceShow, true)
}

export function onNodeMouseOut<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, sel, config: SankeyConfig<N, L>): void {
  sel
    .select(`.${s.labelGroup}`)
    .classed(s.forceShow, false)
}
