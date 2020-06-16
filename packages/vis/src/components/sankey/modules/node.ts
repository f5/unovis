// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'
import { getValue } from 'utils/data'

// Types
import { WrapTextOptions } from 'types/text'
import { Spacing } from 'types/misc'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, LabelPosition } from 'types/sankey'
import { ExitTransitionType, EnterTransitionType } from 'types/animation'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

const NODE_LABEL_SPACING = 10
const ARROW_HEIGHT = 8
const ARROW_WIDTH = 5
const BACKGROUND_LABEL_PADDING = 2
const LABEL_TOP_MARGIN = 2

function getLabelBackground (width: number, height: number): string {
  const halfHeight = height / 2
  const halfArrowHeight = ARROW_HEIGHT / 2
  const leftArrowPos = `L 0 ${halfHeight - halfArrowHeight}   L   ${-ARROW_WIDTH} ${halfHeight} L 0 ${halfHeight + halfArrowHeight}`
  return `
    M 0 0 
    ${leftArrowPos}
    L 0  ${height}
    L ${width} ${height} 
    L ${width} 0 
    L 0 0 `
}

const backgroundLabelWidth = (nodeWidth: number, nodeHorizontalSpacing: number): number => nodeHorizontalSpacing - nodeWidth - ARROW_WIDTH - NODE_LABEL_SPACING * 2
const backgroundLabelHeight = (labelFontSize: number): number => labelFontSize * 2.8

export function getWrapOption (config, trimText = true): WrapTextOptions {
  const { labelWidth, labelTextSeparator, labelForceWordBreak, labelLength, labelTrim, labelPosition, nodeHorizontalSpacing, nodeWidth } = config
  return {
    width: labelPosition === LabelPosition.AUTO ? labelWidth : backgroundLabelWidth(nodeWidth, nodeHorizontalSpacing) - BACKGROUND_LABEL_PADDING * 2,
    separator: labelTextSeparator,
    wordBreak: labelForceWordBreak,

    length: trimText && labelLength,
    trimType: trimText && labelTrim,
    dy: labelPosition === LabelPosition.AUTO ? 0.32 : 1,
    trimOnly: labelPosition === LabelPosition.RIGHT,
  }
}

export function createNodes<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, bleed: Spacing): void {
  const { labelPosition, enterTransitionType } = config

  // Node
  sel.append('rect')
    .attr('class', s.node)
    .attr('width', config.nodeWidth)
    .attr('height', d => d.y1 - d.y0)
    .style('fill', node => getColor(node, config.nodeColor))

  // Label background
  const labelGroup = sel.append('g')
    .attr('class', s.labelGroup)

  labelGroup.append('path').attr('class', s.labelBackground)

  // Label
  labelGroup.append('text').attr('class', s.nodeLabel)
    .attr('x', labelPosition === LabelPosition.AUTO ? -NODE_LABEL_SPACING : ARROW_WIDTH + BACKGROUND_LABEL_PADDING)
    // .attr('y', d => labelPosition === LabelPosition.AUTO ? (d.y1 - d.y0) / 2 : BACKGROUND_LABEL_PADDING + LABEL_TOP_MARGIN)

  // Sub label
  labelGroup.append('text').attr('class', s.nodeSubLabel)
    .attr('y', BACKGROUND_LABEL_PADDING + LABEL_TOP_MARGIN)

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
  const { labelPosition } = config

  sel.classed(s.visibleLabel, d => d.y1 - d.y0 > (labelPosition === LabelPosition.AUTO ? config.labelFontSize : backgroundLabelHeight(config.labelFontSize) + BACKGROUND_LABEL_PADDING * 2) || config.forceShowLabels)

  smartTransition(sel, duration / 2)
    .attr('transform', d => `translate(${sel.size() === 1 ? config.width * 0.5 - bleed.left : d.x0},${d.y0})`)
    .style('opacity', 1)

  // Node
  smartTransition(sel.select(`.${s.node}`), duration)
    .attr('width', config.nodeWidth)
    .attr('height', d => d.y1 - d.y0)

  // Label
  const labelGroupSelection = sel.select(`.${s.labelGroup}`)

  const labelSelection = labelGroupSelection.select(`.${s.nodeLabel}`)
  labelSelection
    .text(config.nodeLabel)
    .style('font-size', config.labelFontSize)

  switch (labelPosition) {
  case LabelPosition.AUTO: {
    labelSelection
      .attr('x', d => d.x0 < config.width / 2 ? -NODE_LABEL_SPACING : config.nodeWidth + NODE_LABEL_SPACING)
      .attr('text-anchor', d => d.x0 < config.width / 2 ? 'end' : 'start')

    smartTransition(labelGroupSelection, duration)
      .attr('transform', d => `translate(0, ${(d.y1 - d.y0) / 2})`)

    break
  }
  case LabelPosition.RIGHT: {
    labelSelection
      .attr('dy', '1.2em')
      .attr('x', ARROW_WIDTH + BACKGROUND_LABEL_PADDING)

    const subLabelSelection = labelGroupSelection.select(`.${s.nodeSubLabel}`)
    subLabelSelection
      .text(d => {
        let text = getValue(d, config.nodeSubLabel)
        if (typeof text === 'number') text = text.toFixed(2)
        return text
      })
      .attr('dy', `${2.32 * 1.2}em`)
      .attr('x', ARROW_WIDTH + BACKGROUND_LABEL_PADDING)
      .attr('text-anchor', 'start')
      .style('font-size', config.labelFontSize * 0.8)

    const labelBackground = labelGroupSelection.select(`.${s.labelBackground}`)
    labelBackground
      .attr('d', () => {
        const w = backgroundLabelWidth(config.nodeWidth, config.nodeHorizontalSpacing) + BACKGROUND_LABEL_PADDING * 2
        const h = backgroundLabelHeight(config.labelFontSize) + BACKGROUND_LABEL_PADDING * 2
        return getLabelBackground(w, h)
      })

    smartTransition(labelGroupSelection, duration)
      .attr('transform', d => {
        const nodeHeight = d.y1 - d.y0
        const h = backgroundLabelHeight(config.labelFontSize) + BACKGROUND_LABEL_PADDING * 2
        const dy = nodeHeight > h ? 0 : (nodeHeight - h) / 2
        return `translate(${config.nodeWidth + NODE_LABEL_SPACING}, ${dy})`
      })
  }
  }

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
  const transitionSelection = smartTransition(selection, duration / 2)
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
  sel.classed(s.visibleLabel, true)
  sel.select(`.${s.nodeLabel}`)
    .text(config.nodeLabel)
    .call(wrapTextElement, getWrapOption(config, false))
}

export function onNodeMouseOut<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>): void {
  const { labelPosition } = config
  sel.classed(s.visibleLabel, d => d.y1 - d.y0 > (labelPosition === LabelPosition.AUTO ? config.labelFontSize : backgroundLabelHeight(config.labelFontSize) + BACKGROUND_LABEL_PADDING * 2) || config.forceShowLabels)
  sel.select(`.${s.nodeLabel}`)
    .text(config.nodeLabel)
    .call(wrapTextElement, getWrapOption(config))
}
