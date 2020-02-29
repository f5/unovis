// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Types
import { WrapTextOptions } from 'types/text'
import { Spacing } from 'types/misc'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface } from './types'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

export function getWrapOption (config, trimText = true): WrapTextOptions {
  const { labelWidth, labelTextSeparator, labelForceWordBreak, labelLength, labelTrim } = config
  return {
    width: labelWidth,
    separator: labelTextSeparator,
    wordBreak: labelForceWordBreak,

    length: trimText && labelLength,
    trimType: trimText && labelTrim,
  }
}

export function createNodes<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, bleed: Spacing): void {
  sel.append('rect')
    .attr('width', config.nodeWidth)
    .attr('height', d => d.y1 - d.y0)
    .style('fill', node => getColor(node, config.nodeColor))

  sel.append('text').attr('class', s.nodeLabel)
    .attr('x', -5)
    .attr('y', d => (d.y1 - d.y0) / 2)
  sel.append('text').attr('class', s.nodeIcon)
    .attr('text-anchor', 'middle')
    .attr('dy', '2px')

  sel
    .attr('transform', d => `translate(${sel.size() === 1 ? config.width * 0.5 - bleed.left : d.x0},${d.y0})`)
    .style('opacity', 0)
}

export function updateNodes<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, bleed: Spacing, duration: number): void {
  smartTransition(sel, duration)
    .attr('transform', d => `translate(${sel.size() === 1 ? config.width * 0.5 - bleed.left : d.x0},${d.y0})`)
    .style('opacity', 1)

  smartTransition(sel.select('rect'), duration)
    .attr('width', config.nodeWidth)
    .attr('height', d => d.y1 - d.y0)

  const labelSelection = sel.select(`.${s.nodeLabel}`)
  labelSelection
    .classed('visible', d => d.y1 - d.y0 > 10 || config.forceShowLabels)
    .text(config.nodeLabel)
    .attr('dy', '0.32em')
    .attr('text-anchor', 'end')
    .style('font-size', config.labelFontSize)
    .filter(d => d.x0 > config.width / 2)
    .attr('x', 5 + config.nodeWidth)
    .attr('text-anchor', 'start')

  smartTransition(labelSelection, duration)
    .attr('y', d => (d.y1 - d.y0) / 2)

  labelSelection.each((d, i, elements) => {
    select(elements[i]).call(wrapTextElement, getWrapOption(config))
  })

  const nodeIcon = sel.select(`.${s.nodeIcon}`)
  if (config.nodeIcon) {
    nodeIcon
      .attr('visibility', null)
      .attr('x', config.nodeWidth / 2)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('stroke', node => getColor(node, config.iconColor))
      .html(config.nodeIcon)
  } else {
    nodeIcon
      .attr('visibility', 'hidden')
  }
}

export function removeNodes (sel): void {
  sel.remove()
}

export function onNodeMouseOver<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>): void {
  sel.select(`.${s.nodeLabel}`)
    .classed('visible', true)
    .text(config.nodeLabel)
    .call(wrapTextElement, getWrapOption(config, false))
}

export function onNodeMouseOut<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>): void {
  sel.select(`.${s.nodeLabel}`)
    .classed('visible', d => d.y1 - d.y0 > 10 || config.forceShowLabels)
    .text(config.nodeLabel)
    .call(wrapTextElement, getWrapOption(config))
}
