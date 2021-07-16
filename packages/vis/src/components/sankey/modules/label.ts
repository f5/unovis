// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'

// Utils
import { estimateTextSize, trimSVGText, wrapSVGText } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getValue } from 'utils/data'

// Types
import { FitMode, VerticalAlign } from 'types/text'
import { Position } from 'types/position'

// Local Types
import { InputLink, InputNode, SankeyNode, SubLabelPlacement } from '../types'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

const NODE_LABEL_SPACING = 10
const LABEL_BLOCK_PADDING = 6.5

function getLabelBackground (width: number, height: number, orientation: Position.Left | Position.Right, arrowWidth = 5, arrowHeight = 8): string {
  const halfHeight = height / 2
  const halfArrowHeight = arrowHeight / 2

  if (orientation === Position.Left) {
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

export function getLabelOrientation<N extends InputNode, L extends InputLink> (d: SankeyNode<N, L>, sankeyWidth: number, labelPosition: Position): (Position.Left | Position.Right) {
  const orientation = labelPosition === Position.Auto
    ? d.x0 < sankeyWidth / 2 ? Position.Left : Position.Right
    : labelPosition

  return orientation as (Position.Left | Position.Right)
}

export const requiredLabelSpace = (labelWidth: number, labelFontSize: number): { width: number; height: number } => {
  return {
    height: labelFontSize * 2 + 2 * LABEL_BLOCK_PADDING, // Assuming 2.5 lines per label
    width: labelWidth + 2 * NODE_LABEL_SPACING + 2 * LABEL_BLOCK_PADDING,
  }
}

export function getLabelGroupXTranslate<N extends InputNode, L extends InputLink> (d: SankeyNode<N, L>, config: SankeyConfig<N, L>): number {
  const orientation = getLabelOrientation(d, config.width, config.labelPosition)
  switch (orientation) {
    case Position.Right: return config.nodeWidth + NODE_LABEL_SPACING
    case Position.Left:
    default:
      return -NODE_LABEL_SPACING
  }
}

export function getLabelGroupYTranslate<N extends InputNode, L extends InputLink> (d: SankeyNode<N, L>, labelGroupHeight: number, config: SankeyConfig<N, L>): number {
  const nodeHeight = d.y1 - d.y0
  if (config.labelBackground && (nodeHeight < labelGroupHeight)) return (nodeHeight - labelGroupHeight) / 2

  switch (config.labelVerticalAlign) {
    case VerticalAlign.Bottom: return nodeHeight - labelGroupHeight
    case VerticalAlign.Middle: return nodeHeight / 2 - labelGroupHeight / 2
    case VerticalAlign.Top:
    default: return 0
  }
}

export function getLabelTextAnchor<N extends InputNode, L extends InputLink> (d: SankeyNode<N, L>, config: SankeyConfig<N, L>): string {
  const orientation = getLabelOrientation(d, config.width, config.labelPosition)
  switch (orientation) {
    case Position.Right: return 'start'
    case Position.Left:
    default:
      return 'end'
  }
}

export function getSubLabelTextAnchor<N extends InputNode, L extends InputLink> (d: SankeyNode<N, L>, config: SankeyConfig<N, L>): string {
  const isSublabelInline = config.subLabelPlacement === SubLabelPlacement.Inline
  const orientation = getLabelOrientation(d, config.width, config.labelPosition)
  switch (orientation) {
    case Position.Right: return isSublabelInline ? 'end' : 'start'
    case Position.Left:
    default:
      return isSublabelInline ? 'start' : 'end'
  }
}

export function renderLabel<N extends InputNode, L extends InputLink> (
  labelGroup: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, any>,
  d: SankeyNode<N, L>,
  config: SankeyConfig<N, L>,
  duration: number,
  forceExpand = false): { x: number; y: number; width: number; height: number; layer: number; selection: any; hidden?: boolean } {
  const labelTextSelection: Selection<SVGTextElement, SankeyNode<N, L>, SVGGElement, SankeyNode<N, L>> = labelGroup.select(`.${s.label}`)
  const labelShowBackground = config.labelBackground || forceExpand
  const sublabelTextSelection: Selection<SVGTextElement, SankeyNode<N, L>, SVGGElement, SankeyNode<N, L>> = labelGroup.select(`.${s.sublabel}`)
  const labelPadding = labelShowBackground ? LABEL_BLOCK_PADDING : 0
  const isSublabelInline = config.subLabelPlacement === SubLabelPlacement.Inline
  const separator = config.labelForceWordBreak ? '' : config.labelTextSeparator
  const fastEstimatesMode = true // Fast but inaccurate
  const fontWidthToHeightRatio = 0.52
  const dy = 0.32
  const labelOrientation = config.labelPosition === Position.Auto
    ? d.x0 < config.width / 2 ? Position.Left : Position.Right
    : config.labelPosition
  const labelOrientationMult = labelOrientation === Position.Left ? -1 : 1
  const labelText = getValue(d, config.label)
  const sublabelText = getValue(d, config.subLabel)

  // Render the main label, wrap / trim it and estimate its size
  const labelsFontSizeDifference = sublabelText ? config.labelFontSize - config.subLabelFontSize : 0
  const labelTranslateY = labelPadding + ((isSublabelInline && labelsFontSizeDifference < 0) ? -0.6 * labelsFontSizeDifference : 0)
  labelTextSelection
    .text(labelText)
    .attr('font-size', config.labelFontSize)
    .style('fill', getValue(d, config.labelColor))
    .attr('transform', `translate(${labelOrientationMult * labelPadding},${labelTranslateY})`)

  const labelMaxWidth = isSublabelInline ? config.labelMaxWidth * (1 - (sublabelText ? config.subLabelToLabelInlineWidthRatio : 0)) : config.labelMaxWidth
  if (config.labelFit === FitMode.Wrap || forceExpand) wrapSVGText(labelTextSelection, { width: labelMaxWidth, separator, verticalAlign: VerticalAlign.Top })
  else trimSVGText(labelTextSelection, labelMaxWidth, config.labelTrimMode, fastEstimatesMode, config.labelFontSize, fontWidthToHeightRatio)

  const labelSize = estimateTextSize(labelTextSelection, config.labelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Render the sub-label, wrap / trim it and estimate its size
  const sublabelTranslateX = labelOrientationMult * (labelPadding + (isSublabelInline ? config.labelMaxWidth : 0))
  const sublabelTranslateY = labelPadding + (isSublabelInline
    ? (labelsFontSizeDifference > 0 ? 0.6 * labelsFontSizeDifference : 0)
    : labelSize.height)
  sublabelTextSelection
    .text(sublabelText)
    .attr('font-size', config.subLabelFontSize)
    .style('fill', getValue(d, config.subLabelColor))
    .attr('transform', `translate(${sublabelTranslateX},${sublabelTranslateY})`)

  const sublabelMaxWidth = isSublabelInline ? config.labelMaxWidth * config.subLabelToLabelInlineWidthRatio : config.labelMaxWidth
  if (config.labelFit === FitMode.Wrap || forceExpand) wrapSVGText(sublabelTextSelection, { width: sublabelMaxWidth, separator, verticalAlign: VerticalAlign.Top })
  else trimSVGText(sublabelTextSelection, sublabelMaxWidth, config.labelTrimMode, fastEstimatesMode, config.subLabelFontSize, fontWidthToHeightRatio)

  const sublabelSize = estimateTextSize(sublabelTextSelection, config.subLabelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Draw the background if needed
  const labelGroupHeight = (isSublabelInline ? Math.max(labelSize.height, sublabelSize.height) : (labelSize.height + sublabelSize.height)) + 2 * labelPadding
  const labelBackground = labelGroup.select(`.${s.labelBackground}`)

  labelBackground
    .attr('d', labelShowBackground ? getLabelBackground(config.labelMaxWidth + 2 * labelPadding, labelGroupHeight, labelOrientation as (Position.Left | Position.Right)) : null)

  // Position the label
  const labelTextAnchor = getLabelTextAnchor(d, config)
  const sublabelTextAnchor = getSubLabelTextAnchor(d, config)
  const xTranslate = getLabelGroupXTranslate(d, config)
  const yTranslate = getLabelGroupYTranslate(d, labelGroupHeight, config)

  labelTextSelection.attr('text-anchor', labelTextAnchor)
  sublabelTextSelection.attr('text-anchor', sublabelTextAnchor)

  const hasTransform = !!labelGroup.attr('transform')
  smartTransition(labelGroup, hasTransform ? duration : 0)
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
