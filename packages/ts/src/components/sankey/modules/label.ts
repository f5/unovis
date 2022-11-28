import { Selection } from 'd3-selection'

// Utils
import { estimateTextSize, trimSVGText, wrapSVGText } from 'utils/text'
import { smartTransition } from 'utils/d3'
import { getString, getValue } from 'utils/data'
import { getColor } from 'utils/color'
import { getCSSVariablePixels } from 'utils/misc'

// Types
import { GenericAccessor } from 'types/accessor'
import { FitMode, VerticalAlign } from 'types/text'
import { Position } from 'types/position'

// Local Types
import { SankeyInputLink, SankeyInputNode, SankeyNode, SankeySubLabelPlacement } from '../types'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'


const NODE_LABEL_SPACING = 10
const LABEL_BLOCK_PADDING = 6.5

function getLabelBackground (
  width: number,
  height: number,
  orientation: Position.Left | Position.Right,
  arrowWidth = 5,
  arrowHeight = 8
): string {
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

export function getLabelOrientation<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  sankeyWidth: number,
  labelPosition: GenericAccessor<Position.Auto | Position.Left | Position.Right | string, N>
): (Position.Left | Position.Right) {
  let orientation = getValue(d, labelPosition)
  if (orientation === Position.Auto || !orientation) {
    orientation = d.x0 < sankeyWidth / 2 ? Position.Left : Position.Right
  }

  return orientation as (Position.Left | Position.Right)
}

export const requiredLabelSpace = (labelWidth: number, labelFontSize: number): { width: number; height: number } => {
  return {
    height: labelFontSize * 2.5 + 2 * LABEL_BLOCK_PADDING, // Assuming 2.5 lines per label
    width: labelWidth + 2 * NODE_LABEL_SPACING + 2 * LABEL_BLOCK_PADDING,
  }
}

export function getLabelGroupXTranslate<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfig<N, L>,
  width: number
): number {
  const orientation = getLabelOrientation(d, width, config.labelPosition)
  switch (orientation) {
    case Position.Right: return config.nodeWidth + NODE_LABEL_SPACING
    case Position.Left:
    default:
      return -NODE_LABEL_SPACING
  }
}

export function getLabelGroupYTranslate<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  labelGroupHeight: number,
  config: SankeyConfig<N, L>
): number {
  const nodeHeight = d.y1 - d.y0
  if (config.labelBackground && (nodeHeight < labelGroupHeight)) return (nodeHeight - labelGroupHeight) / 2

  switch (config.labelVerticalAlign) {
    case VerticalAlign.Bottom: return nodeHeight - labelGroupHeight
    case VerticalAlign.Middle: return nodeHeight / 2 - labelGroupHeight / 2
    case VerticalAlign.Top:
    default: return 0
  }
}

export function getLabelTextAnchor<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfig<N, L>,
  width: number
): string {
  const orientation = getLabelOrientation(d, width, config.labelPosition)
  switch (orientation) {
    case Position.Right: return 'start'
    case Position.Left:
    default:
      return 'end'
  }
}

export function getSubLabelTextAnchor<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfig<N, L>,
  width: number
): string {
  const isSublabelInline = config.subLabelPlacement === SankeySubLabelPlacement.Inline
  const orientation = getLabelOrientation(d, width, config.labelPosition)
  switch (orientation) {
    case Position.Right: return isSublabelInline ? 'end' : 'start'
    case Position.Left:
    default:
      return isSublabelInline ? 'start' : 'end'
  }
}

export function renderLabel<N extends SankeyInputNode, L extends SankeyInputLink> (
  labelGroup: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, any>,
  d: SankeyNode<N, L>,
  config: SankeyConfig<N, L>,
  width: number,
  duration: number,
  forceExpand = false
): { x: number; y: number; width: number; height: number; layer: number; selection: any; hidden?: boolean } {
  const labelTextSelection: Selection<SVGTextElement, SankeyNode<N, L>, SVGGElement, SankeyNode<N, L>> = labelGroup.select(`.${s.label}`)
  const labelShowBackground = config.labelBackground || forceExpand
  const sublabelTextSelection: Selection<SVGTextElement, SankeyNode<N, L>, SVGGElement, SankeyNode<N, L>> = labelGroup.select(`.${s.sublabel}`)
  const labelPadding = labelShowBackground ? LABEL_BLOCK_PADDING : 0
  const isSublabelInline = config.subLabelPlacement === SankeySubLabelPlacement.Inline
  const separator = config.labelForceWordBreak ? '' : config.labelTextSeparator
  const fastEstimatesMode = true // Fast but inaccurate
  const fontWidthToHeightRatio = 0.52
  const dy = 0.32
  const labelOrientation = getLabelOrientation(d, width, config.labelPosition)
  const labelOrientationMult = labelOrientation === Position.Left ? -1 : 1
  const labelText = getString(d, config.label)
  const sublabelText = getString(d, config.subLabel)
  let wasTrimmed = false

  const labelFontSize = config.labelFontSize ?? getCSSVariablePixels('var(--vis-sankey-node-label-font-size)', labelGroup.node())
  const subLabelFontSize = config.subLabelFontSize ?? getCSSVariablePixels('var(--vis-sankey-node-sublabel-font-size)', labelGroup.node())

  // Render the main label, wrap / trim it and estimate its size
  const labelsFontSizeDifference = sublabelText ? labelFontSize - subLabelFontSize : 0
  const labelTranslateY = labelPadding + ((isSublabelInline && labelsFontSizeDifference < 0) ? -0.6 * labelsFontSizeDifference : 0)
  labelTextSelection
    .text(labelText)
    .attr('font-size', labelFontSize)
    .style('fill', getColor(d, config.labelColor))
    .attr('transform', `translate(${labelOrientationMult * labelPadding},${labelTranslateY})`)
    .style('cursor', (d: SankeyNode<N, L>) => getString(d, config.labelCursor))

  const labelMaxWidth = isSublabelInline ? config.labelMaxWidth * (1 - (sublabelText ? config.subLabelToLabelInlineWidthRatio : 0)) : config.labelMaxWidth
  if (config.labelFit === FitMode.Wrap || forceExpand) wrapSVGText(labelTextSelection, { width: labelMaxWidth, separator, verticalAlign: VerticalAlign.Top })
  else wasTrimmed = trimSVGText(labelTextSelection, labelMaxWidth, config.labelTrimMode, fastEstimatesMode, labelFontSize, fontWidthToHeightRatio)

  const labelSize = estimateTextSize(labelTextSelection, labelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Render the sub-label, wrap / trim it and estimate its size
  const sublabelTranslateX = labelOrientationMult * (labelPadding + (isSublabelInline ? config.labelMaxWidth : 0))
  const sublabelMarginTop = 0
  const sublabelTranslateY = labelPadding + (isSublabelInline
    ? (labelsFontSizeDifference > 0 ? 0.6 * labelsFontSizeDifference : 0)
    : labelSize.height + sublabelMarginTop)
  sublabelTextSelection
    .text(sublabelText)
    .attr('font-size', subLabelFontSize)
    .style('fill', getColor(d, config.subLabelColor))
    .attr('transform', `translate(${sublabelTranslateX},${sublabelTranslateY})`)
    .style('cursor', (d: SankeyNode<N, L>) => getString(d, config.labelCursor))

  const sublabelMaxWidth = isSublabelInline ? config.labelMaxWidth * config.subLabelToLabelInlineWidthRatio : config.labelMaxWidth
  if (config.labelFit === FitMode.Wrap || forceExpand) wrapSVGText(sublabelTextSelection, { width: sublabelMaxWidth, separator, verticalAlign: VerticalAlign.Top })
  else wasTrimmed = wasTrimmed || trimSVGText(sublabelTextSelection, sublabelMaxWidth, config.labelTrimMode, fastEstimatesMode, subLabelFontSize, fontWidthToHeightRatio)

  labelGroup.classed(s.labelTrimmed, wasTrimmed)
  const sublabelSize = estimateTextSize(sublabelTextSelection, subLabelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Draw the background if needed
  const labelGroupHeight = (isSublabelInline ? Math.max(labelSize.height, sublabelSize.height) : (labelSize.height + sublabelSize.height)) + 2 * labelPadding
  const labelBackground = labelGroup.select(`.${s.labelBackground}`)

  labelBackground
    .attr('d', labelShowBackground ? getLabelBackground(config.labelMaxWidth + 2 * labelPadding, labelGroupHeight, labelOrientation as (Position.Left | Position.Right)) : null)

  // Position the label
  const labelTextAnchor = getLabelTextAnchor(d, config, width)
  const sublabelTextAnchor = getSubLabelTextAnchor(d, config, width)
  const xTranslate = getLabelGroupXTranslate(d, config, width)
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
