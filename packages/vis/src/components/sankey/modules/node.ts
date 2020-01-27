// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { color } from 'd3-color'

// Utils
import { wrapTextElement } from 'utils/text'
import { getColor } from 'utils/color'

// Types
import { WrapTextOptions } from 'types/text'

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

export function createNodes (sel, config): void {
  sel.append('rect').style('fill', node => getColor(node, config.nodeColor, '-sankey-node'))
  sel.append('text').attr('class', s.nodeLabel)
  sel.append('text').attr('class', s.nodeIcon)
    .attr('text-anchor', 'middle')
    .attr('dy', '2px')
}

export function updateNodes (sel, config, sankey): void {
  sel.attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')
  sel.select('rect')
    .attr('width', sankey.nodeWidth())
    .attr('height', d => d.y1 - d.y0)

  sel.select(`.${s.nodeLabel}`)
    .classed('visible', d => d.y1 - d.y0 > 10 || config.showLabels)
    .attr('x', -5)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('dy', '0.32em')
    .attr('text-anchor', 'end')
    .text(config.nodeLabel)
    .filter(d => d.x0 > config.width / 2)
    .attr('x', 5 + sankey.nodeWidth())
    .attr('text-anchor', 'start')
  sel.select(`.${s.nodeLabel}`).each((d, i, elements) => {
    select(elements[i]).call(wrapTextElement, getWrapOption(config))
  })

  sel.select(`.${s.nodeIcon}`)
    .attr('x', sankey.nodeWidth() / 2)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('text-anchor', 'middle')
    .style('stroke', node => getColor(node, config.iconColor, '-sankey-icon'))
    .html(config.nodeIcon)
}

export function removeNodes (sel): void {
  sel.exit().remove()
}

export function onNodeMouseOver (sel, config): void {
  sel.select('rect')
    .style('fill', node => {
      const c = getColor(node, config.nodeColor, '-sankey-node-hover')
      const fillColor = color(c)
      if (fillColor) return fillColor.darker(0.5)
      return c
    })
  sel.select(`.${s.nodeLabel}`)
    .classed('visible', true)
    .text(config.nodeLabel)
    .call(wrapTextElement, getWrapOption(config, false))
}

export function onNodeMouseOut (sel, config): void {
  sel.select('rect')
    .style('fill', node => getColor(node, config.nodeColor, '-sankey-node'))
  sel.select(`.${s.nodeLabel}`)
    .classed('visible', d => d.y1 - d.y0 > 10 || config.showLabels)
    .text(config.nodeLabel)
    .call(wrapTextElement, getWrapOption(config))
}
