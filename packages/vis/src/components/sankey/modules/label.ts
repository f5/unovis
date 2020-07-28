// Copyright (c) Volterra, Inc. All rights reserved.
// Utils
import { trimSVGText, wrapSVGText, estimateTextSize } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getValue } from 'utils/data'

// Types
import { VerticalAlign } from 'types/text'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, SubLabelPlacement } from 'types/sankey'
import { Position } from 'types/position'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

const NODE_LABEL_SPACING = 10
const LABEL_BLOCK_PADDING = 6

function getLabelBackground (width: number, height: number, arrowWidth = 5, arrowHeight = 8): string {
  const halfHeight = height / 2
  const halfArrowHeight = arrowHeight / 2
  const leftArrowPos = `L 0 ${halfHeight - halfArrowHeight}   L   ${-arrowWidth} ${halfHeight} L 0 ${halfHeight + halfArrowHeight}`
  return `
    M 0 0 
    ${leftArrowPos}
    L 0  ${height}
    L ${width} ${height} 
    L ${width} 0 
    L 0 0 `
}

export const requiredLabelSpace = (labelWidth: number, labelFontSize: number, labelBackground: boolean): { width: number; height: number } => {
  return {
    height: labelFontSize * 2 + (labelBackground ? 2 * LABEL_BLOCK_PADDING : 0), // Assuming 2 lines per label
    width: labelWidth + 2 * NODE_LABEL_SPACING + (labelBackground ? 2 * LABEL_BLOCK_PADDING : 0),
  }
}

function getSublabelFontSize (labelFontSize: number): number {
  return labelFontSize * 0.8
}

export function getLabelGroupXTranslate<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, config: SankeyConfig<N, L>): number {
  switch (config.labelPosition) {
  case Position.RIGHT: return config.nodeWidth + NODE_LABEL_SPACING
  case Position.LEFT: return -NODE_LABEL_SPACING
  case Position.AUTO:
  default: {
    const onLeftSize = d.x0 < config.width / 2
    return onLeftSize ? -NODE_LABEL_SPACING : config.nodeWidth + NODE_LABEL_SPACING
  }
  }
}

export function getLabelGroupYTranslate<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, labelGroupHeight: number, config: SankeyConfig<N, L>): number {
  const nodeHeight = d.y1 - d.y0
  if (config.labelBackground && (nodeHeight < labelGroupHeight)) return (nodeHeight - labelGroupHeight) / 2

  switch (config.labelVerticalAlign) {
  case VerticalAlign.BOTTOM: return nodeHeight - labelGroupHeight
  case VerticalAlign.MIDDLE: return nodeHeight / 2 - labelGroupHeight / 2
  case VerticalAlign.TOP:
  default: return 0
  }
}

export function getLabelTextAchor<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, config: SankeyConfig<N, L>): string {
  switch (config.labelPosition) {
  case Position.RIGHT: return 'start'
  case Position.LEFT: return 'end'
  case Position.AUTO:
  default: {
    const onLeftSize = d.x0 < config.width / 2
    return onLeftSize ? 'end' : 'start'
  }
  }
}

export function renderLabel<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (labelGroup, d: N, config: SankeyConfig<N, L>, duration: number): { x: number; y: number; width: number; height: number; layer: number; selection: any } {
  const labelText = labelGroup.select(`.${s.label}`)
  const sublabelText = labelGroup.select(`.${s.sublabel}`)
  const labelPadding = config.labelBackground ? LABEL_BLOCK_PADDING : 0
  const isSublabelInline = config.subLabelPlacement === SubLabelPlacement.INLINE
  const separator = config.labelForceWordBreak ? '' : config.labelTextSeparator
  const fastEstimatesMode = true // Fast but inaccurate
  const fontWidthToHeightRatio = 0.5
  const dy = 0.32

  // Render the main label, wrap / trim it and estimate its size
  labelText
    .text(getValue(d, config.label))
    .attr('font-size', config.labelFontSize)
    .style('fill', getValue(d, config.labelColor))
    .attr('transform', `translate(${labelPadding},${labelPadding})`)

  if (isSublabelInline) {
    trimSVGText(labelText, config.labelMaxWidth * 2 / 3, config.labelTrimMode, fastEstimatesMode, config.labelFontSize, fontWidthToHeightRatio)
  } else {
    wrapSVGText(labelText, { width: config.labelMaxWidth, separator, verticalAlign: VerticalAlign.TOP })
  }
  const labelSize = estimateTextSize(labelText, config.labelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Render the sublabel, wrap / trim it and estimate its size
  const sublabelFontSize = getSublabelFontSize(config.labelFontSize)
  const sublabelTranslateX = labelPadding + (isSublabelInline ? config.labelMaxWidth : 0)
  const sublabelTranslateY = labelPadding + (isSublabelInline ? 0.25 * sublabelFontSize : labelSize.height)
  sublabelText
    .text(getValue(d, config.subLabel))
    .attr('font-size', sublabelFontSize)
    .style('fill', getValue(d, config.subLabelColor))
    .attr('transform', `translate(${sublabelTranslateX},${sublabelTranslateY})`)

  if (isSublabelInline) {
    trimSVGText(sublabelText, config.labelMaxWidth * 1 / 3, config.labelTrimMode, fastEstimatesMode, config.labelFontSize, fontWidthToHeightRatio)
  } else {
    wrapSVGText(sublabelText, { width: config.labelMaxWidth, separator, verticalAlign: VerticalAlign.TOP })
  }

  const sublabelSize = estimateTextSize(sublabelText, sublabelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Draw the background if needed
  const labelGroupHeight = labelSize.height + (isSublabelInline ? 0 : sublabelSize.height) + 2 * labelPadding
  const labelBackground = labelGroup.select(`.${s.labelBackground}`)
  labelBackground
    .attr('d', config.labelBackground ? getLabelBackground(config.labelMaxWidth + 2 * labelPadding, labelGroupHeight) : null)

  // Position the label
  const textAnchor = getLabelTextAchor(d, config)
  const xTranslate = getLabelGroupXTranslate(d, config)
  const yTranslate = getLabelGroupYTranslate(d, labelGroupHeight, config)

  labelText.attr('text-anchor', textAnchor)
  sublabelText.attr('text-anchor', isSublabelInline ? 'end' : textAnchor)

  smartTransition(labelGroup, duration)
    .attr('transform', `translate(${xTranslate},${yTranslate})`)

  return {
    x: d.x0 + xTranslate,
    y: d.y0 + yTranslate,
    width: config.labelMaxWidth,
    height: labelGroupHeight,
    layer: d.layer,
    selection: labelGroup,
  }
}
