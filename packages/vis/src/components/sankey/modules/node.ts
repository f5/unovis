// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Types
import { Spacing } from 'types/misc'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface } from 'types/sankey'
import { ExitTransitionType, EnterTransitionType } from 'types/animation'

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
  labelGroup.append('text').attr('class', s.nodeLabel)
  labelGroup.append('text').attr('class', s.nodeSubLabel)

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
    .attr('transform', d => `translate(${sel.size() === 1 ? config.width * 0.5 - bleed.left : d.x0},${d.y0})`)
    .style('opacity', 1)

  // Node
  smartTransition(sel.select(`.${s.node}`), duration)
    .attr('width', config.nodeWidth)
    .attr('height', d => d.y1 - d.y0)

  // Label
  const labelGroupSelection = sel.select(`.${s.labelGroup}`)
  labelGroupSelection.each((d, i, els) => {
    renderLabel(select(els[i]), d, config, duration)
  })

  // Node Icon
  const nodeIcon = sel.select(`.${s.nodeIcon}`)
  if (config.nodeIcon) {
    nodeIcon
      .attr('visibility', null)
      .attr('x', config.nodeWidth / 2)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('stroke', node => getColor(node, config.iconColor))
      .style('fill', node => getColor(node, config.iconColor))
      .style('font-size', node => {
        const nodeHeight = node.y1 - node.y0
        return nodeHeight < s.SANKEY_ICON_SIZE ? `${nodeHeight}px` : null
      })
      .html(config.nodeIcon)
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

export function onNodeMouseOver<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>): void {
  // sel.classed(s.visibleLabel, true)

  // sel.select(`.${s.nodeLabel}`)
  //   .text(config.nodeLabel)
  //   .call(wrapTextElement, getWrapOption(config, false))
}

export function onNodeMouseOut<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>): void {
  // sel.classed(s.visibleLabel, d => shouldLabelBeVisible(d, config))

  // sel.select(`.${s.nodeLabel}`)
  //   .text(config.nodeLabel)
  //   .call(wrapTextElement, getWrapOption(config))
}
