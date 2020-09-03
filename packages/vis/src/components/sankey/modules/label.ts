// Copyright (c) Volterra, Inc. All rights reserved.
// Utils
import { estimateTextSize, trimSVGText, wrapSVGText } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getValue } from 'utils/data'

// Types
import { FitMode, VerticalAlign } from 'types/text'
import { SankeyLinkDatumInterface, SankeyNodeDatumInterface, SubLabelPlacement } from 'types/sankey'
import { Position } from 'types/position'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

const NODE_LABEL_SPACING = 10
const LABEL_BLOCK_PADDING = 6

function getLabelBackground (width: number, height: number, orientation: Position.LEFT | Position.RIGHT, arrowWidth = 5, arrowHeight = 8): string {
  const halfHeight = height / 2
  const halfArrowHeight = arrowHeight / 2

  if (orientation === Position.LEFT) {
    const rightArrowPos = `L 0 ${halfHeight - halfArrowHeight}   L   ${+arrowWidth} ${halfHeight} L 0 ${halfHeight + halfArrowHeight}`
    return `
      M 0 0 
      ${rightArrowPos}
      L 0  ${height}
      L ${-width} ${height} 
      L ${-width} 0 
      L 0 0 `
  } else {
    const leftArrowPos = `L 0 ${halfHeight - halfArrowHeight}   L   ${-arrowWidth} ${halfHeight} L 0 ${halfHeight + halfArrowHeight}`
    return `
      M 0 0 
      ${leftArrowPos}
      L 0  ${height}
      L ${width} ${height} 
      L ${width} 0 
      L 0 0 `
  }
}

export const requiredLabelSpace = (labelWidth: number, labelFontSize: number): { width: number; height: number } => {
  return {
    height: labelFontSize * 2 + 2 * LABEL_BLOCK_PADDING, // Assuming 2.5 lines per label
    width: labelWidth + 2 * NODE_LABEL_SPACING + 2 * LABEL_BLOCK_PADDING,
  }
}

function getSublabelFontSize (labelFontSize: number): number {
  return labelFontSize * 0.8
}

export function getLabelGroupXTranslate<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, config: SankeyConfig<N, L>): number {
  const orientation = getLabelOrientation(d, config.width, config.labelPosition)
  switch (orientation) {
  case Position.RIGHT: return config.nodeWidth + NODE_LABEL_SPACING
  case Position.LEFT:
  default:
    return -NODE_LABEL_SPACING
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

export function getLabelTextAnchor<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, config: SankeyConfig<N, L>): string {
  const orientation = getLabelOrientation(d, config.width, config.labelPosition)
  switch (orientation) {
  case Position.RIGHT: return 'start'
  case Position.LEFT:
  default:
    return 'end'
  }
}

export function getSubLabelTextAnchor<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, config: SankeyConfig<N, L>): string {
  const isSublabelInline = config.subLabelPlacement === SubLabelPlacement.INLINE
  const orientation = getLabelOrientation(d, config.width, config.labelPosition)
  switch (orientation) {
  case Position.RIGHT: return isSublabelInline ? 'end' : 'start'
  case Position.LEFT:
  default:
    return isSublabelInline ? 'start' : 'end'
  }
}

export function getLabelOrientation<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (d: N, sankeyWidth: number, labelPosition: Position): (Position.LEFT | Position.RIGHT) {
  const orientation = labelPosition === Position.AUTO
    ? d.x0 < sankeyWidth / 2 ? Position.LEFT : Position.RIGHT
    : labelPosition

  return orientation as (Position.LEFT | Position.RIGHT)
}

export function renderLabel<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (labelGroup, d: N, config: SankeyConfig<N, L>, duration: number, forceExpand = false): { x: number; y: number; width: number; height: number; layer: number; selection: any } {
  const labelTextSelection = labelGroup.select(`.${s.label}`)
  const labelShowBackground = config.labelBackground || forceExpand
  const sublabelTextSelection = labelGroup.select(`.${s.sublabel}`)
  const labelPadding = labelShowBackground ? LABEL_BLOCK_PADDING : 0
  const isSublabelInline = config.subLabelPlacement === SubLabelPlacement.INLINE
  const separator = config.labelForceWordBreak ? '' : config.labelTextSeparator
  const fastEstimatesMode = true // Fast but inaccurate
  const fontWidthToHeightRatio = 0.52
  const dy = 0.32
  const labelOrientation = config.labelPosition === Position.AUTO
    ? d.x0 < config.width / 2 ? Position.LEFT : Position.RIGHT
    : config.labelPosition
  const labelOrientationMult = labelOrientation === Position.LEFT ? -1 : 1
  const labelText = getValue(d, config.label)
  const sublabelText = getValue(d, config.subLabel)

  // Render the main label, wrap / trim it and estimate its size
  labelTextSelection
    .text(labelText)
    .attr('font-size', config.labelFontSize)
    .style('fill', getValue(d, config.labelColor))
    .attr('transform', `translate(${labelOrientationMult * labelPadding},${labelPadding})`)

  const labelMaxWidth = isSublabelInline ? config.labelMaxWidth * (1 - (sublabelText ? config.subLabelToLabelInlineWidthRatio : 0)) : config.labelMaxWidth
  if (config.labelFit === FitMode.WRAP || forceExpand) wrapSVGText(labelTextSelection, { width: labelMaxWidth, separator, verticalAlign: VerticalAlign.TOP })
  else trimSVGText(labelTextSelection, labelMaxWidth, config.labelTrimMode, fastEstimatesMode, config.labelFontSize, fontWidthToHeightRatio)

  const labelSize = estimateTextSize(labelTextSelection, config.labelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Render the sub-label, wrap / trim it and estimate its size
  const sublabelFontSize = getSublabelFontSize(config.labelFontSize)
  const sublabelTranslateX = labelOrientationMult * (labelPadding + (isSublabelInline ? config.labelMaxWidth : 0))
  const sublabelTranslateY = labelPadding + (isSublabelInline ? 0.18 * sublabelFontSize : labelSize.height)
  sublabelTextSelection
    .text(sublabelText)
    .attr('font-size', sublabelFontSize)
    .style('fill', getValue(d, config.subLabelColor))
    .attr('transform', `translate(${sublabelTranslateX},${sublabelTranslateY})`)

  const sublabelMaxWidth = isSublabelInline ? config.labelMaxWidth * config.subLabelToLabelInlineWidthRatio : config.labelMaxWidth
  if (config.labelFit === FitMode.WRAP || forceExpand) wrapSVGText(sublabelTextSelection, { width: sublabelMaxWidth, separator, verticalAlign: VerticalAlign.TOP })
  else trimSVGText(sublabelTextSelection, sublabelMaxWidth, config.labelTrimMode, fastEstimatesMode, sublabelFontSize, fontWidthToHeightRatio)

  const sublabelSize = estimateTextSize(sublabelTextSelection, sublabelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Draw the background if needed
  const labelGroupHeight = (isSublabelInline ? Math.max(labelSize.height, sublabelSize.height) : (labelSize.height + sublabelSize.height)) + 2 * labelPadding
  const labelBackground = labelGroup.select(`.${s.labelBackground}`)

  labelBackground
    .attr('d', labelShowBackground ? getLabelBackground(config.labelMaxWidth + 2 * labelPadding, labelGroupHeight, labelOrientation as (Position.LEFT | Position.RIGHT)) : null)

  // Position the label
  const labelTextAnchor = getLabelTextAnchor(d, config)
  const sublabelTextAnchor = getSubLabelTextAnchor(d, config)
  const xTranslate = getLabelGroupXTranslate(d, config)
  const yTranslate = getLabelGroupYTranslate(d, labelGroupHeight, config)

  labelTextSelection.attr('text-anchor', labelTextAnchor)
  sublabelTextSelection.attr('text-anchor', sublabelTextAnchor)

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
