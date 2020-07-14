// Copyright (c) Volterra, Inc. All rights reserved.
// Utils
import { trimTextMiddle } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getValue } from 'utils/data'

// Types
import { WrapTextOptions } from 'types/text'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, LabelPosition } from 'types/sankey'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

const NODE_LABEL_SPACING = 10
const ARROW_HEIGHT = 8
const ARROW_WIDTH = 5
const LABEL_BLOCK_PADDING = 3
const LABEL_BLOCK_TOP_MARGIN = 2

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

export const labelBackgroundWidth = (nodeWidth: number, nodeHorizontalSpacing: number): number => nodeHorizontalSpacing - ARROW_WIDTH - NODE_LABEL_SPACING * 2
export const labelBackgroundHeight = (labelFontSize: number): number => labelFontSize + 2 * LABEL_BLOCK_PADDING

export const requiredLabelSpace = (nodeWidth: number, nodeHorizontalSpacing: number, labelFontSize: number): { x: number; y: number } => {
  const w = labelBackgroundWidth(nodeWidth, nodeHorizontalSpacing)
  const h = labelBackgroundHeight(labelFontSize)
  return {
    y: h + LABEL_BLOCK_TOP_MARGIN * 2,
    x: w + ARROW_WIDTH + NODE_LABEL_SPACING * 3,
  }
}
export function shouldLabelBeVisible<N extends SankeyNodeDatumInterface> (d: N, config: SankeyConfig<N, any>): boolean {
  const nodeVerticalSpace = d.y1 - d.y0 + config.nodePadding / 2
  const requiredSpace = config.labelPosition === LabelPosition.AUTO
    ? config.labelFontSize
    : labelBackgroundHeight(config.labelFontSize)

  return config.forceShowLabels || (nodeVerticalSpace > requiredSpace)
}

export function getWrapOption (config, trimText = true): WrapTextOptions {
  const { labelWidth, labelTextSeparator, labelForceWordBreak, labelLength, labelTrim, labelPosition, nodeHorizontalSpacing, nodeWidth } = config
  return {
    width: labelPosition === LabelPosition.AUTO ? labelWidth : labelBackgroundWidth(nodeWidth, nodeHorizontalSpacing) - LABEL_BLOCK_PADDING * 2,
    separator: labelTextSeparator,
    wordBreak: labelForceWordBreak,

    length: trimText && labelLength,
    trimType: trimText && labelTrim,
    dy: labelPosition === LabelPosition.AUTO ? 0.32 : 1,
    trimOnly: labelPosition === LabelPosition.RIGHT,
  }
}

export function renderLabel<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (group, d: N, config: SankeyConfig<N, L>, duration: number): void {
  const isVisible = shouldLabelBeVisible(d, config)
  group.classed(s.visibleLabel, isVisible)
  if (!isVisible) return

  const labelText = group.select(`.${s.nodeLabel}`)
  labelText
    .text(trimTextMiddle(getValue(d, config.label), 25))
    .attr('font-size', config.labelFontSize)
    .style('fill', getValue(d, config.labelColor))

  switch (config.labelPosition) {
  case LabelPosition.AUTO: {
    labelText
      .attr('x', d.x0 < config.width / 2 ? -NODE_LABEL_SPACING : config.nodeWidth + NODE_LABEL_SPACING)
      .attr('text-anchor', d.x0 < config.width / 2 ? 'end' : 'start')

    smartTransition(group, duration)
      .attr('transform', `translate(0, ${(d.y1 - d.y0) / 2})`)

    break
  }
  case LabelPosition.RIGHT: {
    const LabelBlockWidth = labelBackgroundWidth(config.nodeWidth, config.nodeHorizontalSpacing) + LABEL_BLOCK_PADDING * 2
    const labelBlockHeight = labelBackgroundHeight(config.labelFontSize) + LABEL_BLOCK_PADDING * 2

    labelText
      .attr('dy', '1em')
      .attr('y', LABEL_BLOCK_PADDING)
      .attr('x', ARROW_WIDTH + LABEL_BLOCK_PADDING)

    const sublabelText = group.select(`.${s.nodeSubLabel}`)
    sublabelText
      .text(d => {
        let text = getValue(d, config.subLabel)
        if (typeof text === 'number') text = text.toFixed(2)
        return text
      })
      .attr('dy', '1.2em')
      .attr('y', LABEL_BLOCK_PADDING)
      .attr('x', LabelBlockWidth - LABEL_BLOCK_PADDING * 2)
      .attr('text-anchor', 'end')
      .attr('font-size', config.labelFontSize * 0.8)
      .style('fill', getValue(d, config.subLabelColor))

    const labelBackground = group.select(`.${s.labelBackground}`)
    labelBackground
      .attr('d', getLabelBackground(LabelBlockWidth, labelBlockHeight))

    smartTransition(group, duration)
      .attr('transform', d => {
        const nodeHeight = d.y1 - d.y0
        const h = labelBlockHeight
        const dy = nodeHeight > h ? LABEL_BLOCK_TOP_MARGIN : (nodeHeight - h) / 2
        return `translate(${config.nodeWidth + NODE_LABEL_SPACING}, ${dy})`
      })
  }
  }
}
