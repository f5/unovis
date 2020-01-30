// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'
import { getColor } from 'utils/color'

// Types
import { WrapTextOptions } from 'types/text'
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

export function createNodes<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>): void {
  sel.append('rect')
    .style('fill', node => getColor(node, config.nodeColor))

  sel.append('text').attr('class', s.nodeLabel)
  sel.append('text').attr('class', s.nodeIcon)
    .attr('text-anchor', 'middle')
    .attr('dy', '2px')
}

export function updateNodes<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, sankey): void {
  sel.attr('transform', d => `translate(${d.x0},${d.y0})`)
  sel.select('rect')
    .attr('width', sankey.nodeWidth())
    .attr('height', d => d.y1 - d.y0)

  sel.select(`.${s.nodeLabel}`)
    .classed('visible', d => d.y1 - d.y0 > 10 || config.forceShowLabels)
    .attr('x', -5)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('dy', '0.32em')
    .attr('text-anchor', 'end')
    .style('font-size', config.labelFontSize)
    .text(config.nodeLabel)
    .filter(d => d.x0 > sankey.size()[0] / 2)
    .attr('x', 5 + sankey.nodeWidth())
    .attr('text-anchor', 'start')
  sel.select(`.${s.nodeLabel}`).each((d, i, elements) => {
    select(elements[i]).call(wrapTextElement, getWrapOption(config))
  })

  const nodeIcon = sel.select(`.${s.nodeIcon}`)
  if (config.nodeIcon) {
    nodeIcon
      .attr('visibility', null)
      .attr('x', sankey.nodeWidth() / 2)
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
  sel.exit().remove()
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
