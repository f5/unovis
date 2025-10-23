import { Selection } from 'd3-selection'

// Utils
import { estimateStringPixelLength, estimateTextSize, trimSVGText, wrapSVGText } from 'utils/text'
import { clamp, getString, getValue } from 'utils/data'
import { getColor } from 'utils/color'
import { getCSSVariableValueInPixels } from 'utils/misc'
import { cssvar } from 'utils/style'

// Types
import { GenericAccessor } from 'types/accessor'
import { FitMode, VerticalAlign } from 'types/text'
import { Position } from 'types/position'
import { Spacing } from 'types/spacing'

// Local Types
import { SankeyInputLink, SankeyInputNode, SankeyNode, SankeySubLabelPlacement } from '../types'

// Config
import { SankeyConfigInterface } from '../config'

// Styles
import * as s from '../style'

export const SANKEY_LABEL_SPACING = 10
export const SANKEY_LABEL_BLOCK_PADDING = 6.5

export function getLabelFontSize<N extends SankeyInputNode, L extends SankeyInputLink> (
  config: SankeyConfigInterface<N, L>,
  context: SVGElement
): number {
  return config.labelFontSize ?? getCSSVariableValueInPixels(cssvar(s.variables.sankeyNodeLabelFontSize), context)
}

export function getSubLabelFontSize<N extends SankeyInputNode, L extends SankeyInputLink> (
  config: SankeyConfigInterface<N, L>,
  context: SVGElement
): number {
  return config.subLabelFontSize ?? getCSSVariableValueInPixels(cssvar(s.variables.sankeyNodeSublabelFontSize), context)
}

export function estimateRequiredLabelWidth<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfigInterface<N, L>,
  labelFontSize: number,
  subLabelFontSize: number
): number {
  const labelAddWidth = 2 // Adding a few pixels for the label background to look more aligned
  const inlineLabelAddWidth = 8 // Without this, the label anf sub-label will look too close to each other
  const tolerance = 1.1
  const isSublabelInline = config.subLabelPlacement === SankeySubLabelPlacement.Inline
  const labelText = `${getString(d, config.label) ?? ''}` // Stringify because theoretically it can be a number
  const sublabelText = `${getString(d, config.subLabel) ?? ''}` // Stringify because theoretically it can be a number
  const labelTextWidth = tolerance * estimateStringPixelLength(labelText, labelFontSize)
  const sublabelTextWidth = tolerance * estimateStringPixelLength(sublabelText, subLabelFontSize)
  return isSublabelInline ? inlineLabelAddWidth + (labelTextWidth + sublabelTextWidth) : labelAddWidth + Math.max(labelTextWidth, sublabelTextWidth)
}

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
  labelPosition: GenericAccessor<Position.Auto | Position.Left | Position.Right | string, SankeyNode<N, L>>
): (Position.Left | Position.Right) {
  let orientation = getValue(d, labelPosition)
  if (orientation === Position.Auto || !orientation) {
    orientation = d.x1 < sankeyWidth / 2 ? Position.Left : Position.Right
  }

  return orientation as (Position.Left | Position.Right)
}

export function getLabelGroupXTranslate<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfigInterface<N, L>,
  width: number
): number {
  const orientation = getLabelOrientation(d, width, config.labelPosition)
  switch (orientation) {
    case Position.Right: return config.nodeWidth + SANKEY_LABEL_SPACING
    case Position.Left:
    default:
      return -SANKEY_LABEL_SPACING
  }
}

export function getLabelGroupYTranslate<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  labelGroupHeight: number,
  config: SankeyConfigInterface<N, L>
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
  config: SankeyConfigInterface<N, L>,
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
  config: SankeyConfigInterface<N, L>,
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

export function getLabelMaxWidth<N extends SankeyInputNode, L extends SankeyInputLink> (
  d: SankeyNode<N, L>,
  config: SankeyConfigInterface<N, L>,
  labelOrientation: Position.Left | Position.Right,
  layerSpacing: number,
  sankeyMaxLayer: number,
  bleed: Spacing
): number {
  const labelHorizontalPadding = 2 * SANKEY_LABEL_SPACING + 2 * SANKEY_LABEL_BLOCK_PADDING

  // We want to fall through to the default case
  /* eslint-disable no-fallthrough */
  switch (d.layer) {
    case 0:
      if (labelOrientation === Position.Left) return bleed.left - labelHorizontalPadding
    case (sankeyMaxLayer):
      if (labelOrientation === Position.Right) {
        return bleed.right - labelHorizontalPadding
      }
    default:
      return clamp(layerSpacing - labelHorizontalPadding, 0, config.labelMaxWidth ?? Infinity)
  } /* eslint-enable no-fallthrough */
}

export function renderLabel<N extends SankeyInputNode, L extends SankeyInputLink> (
  labelGroup: Selection<SVGGElement, SankeyNode<N, L>, SVGGElement, any>,
  d: SankeyNode<N, L>,
  config: SankeyConfigInterface<N, L>,
  width: number,
  duration: number,
  layerSpacing: number | undefined,
  sankeyMaxLayer: number,
  bleed: Spacing,
  forceExpand = false
): { x: number; y: number; width: number; height: number; layer: number; selection: any; hidden?: boolean } {
  const labelTextSelection: Selection<SVGTextElement, SankeyNode<N, L>, SVGGElement, SankeyNode<N, L>> = labelGroup.select(`.${s.label}`)
  const labelShowBackground = config.labelBackground || forceExpand
  const sublabelTextSelection: Selection<SVGTextElement, SankeyNode<N, L>, SVGGElement, SankeyNode<N, L>> = labelGroup.select(`.${s.sublabel}`)
  const labelPadding = labelShowBackground ? SANKEY_LABEL_BLOCK_PADDING : 0
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

  const labelFontSize = getLabelFontSize(config, labelGroup.node())
  const subLabelFontSize = getSubLabelFontSize(config, labelGroup.node())

  // Render the main label, wrap / trim it and estimate its size
  const labelsFontSizeDifference = sublabelText ? labelFontSize - subLabelFontSize : 0
  const labelTranslateY = labelPadding + ((isSublabelInline && labelsFontSizeDifference < 0) ? -0.6 * labelsFontSizeDifference : 0)
  labelTextSelection
    .text(labelText)
    .attr('font-size', labelFontSize)
    .style('text-decoration', getString(d, config.labelTextDecoration))
    .style('fill', getColor(d, config.labelColor))
    .attr('transform', `translate(${labelOrientationMult * labelPadding},${labelTranslateY})`)
    .style('cursor', (d: SankeyNode<N, L>) => getString(d, config.labelCursor))

  const labelMaxWidth = getLabelMaxWidth(d, config, labelOrientation, layerSpacing, sankeyMaxLayer, bleed)
  const labelWrapTrimWidth = isSublabelInline
    ? labelMaxWidth * (1 - (sublabelText ? config.subLabelToLabelInlineWidthRatio : 0))
    : labelMaxWidth
  if (config.labelFit === FitMode.Wrap || forceExpand) wrapSVGText(labelTextSelection, labelWrapTrimWidth, separator)
  else wasTrimmed = trimSVGText(labelTextSelection, labelWrapTrimWidth, config.labelTrimMode, fastEstimatesMode, labelFontSize, fontWidthToHeightRatio)

  const labelSize = estimateTextSize(labelTextSelection, labelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Render the sub-label, wrap / trim it and estimate its size
  const sublabelTranslateX = labelOrientationMult * (labelPadding + (isSublabelInline ? labelMaxWidth : 0))
  const sublabelMarginTop = 0
  const sublabelTranslateY = labelPadding + (isSublabelInline
    ? (labelsFontSizeDifference > 0 ? 0.6 * labelsFontSizeDifference : 0)
    : labelSize.height + sublabelMarginTop)
  sublabelTextSelection
    .text(sublabelText)
    .attr('font-size', subLabelFontSize)
    .style('text-decoration', getString(d, config.subLabelTextDecoration))
    .style('fill', getColor(d, config.subLabelColor))
    .attr('transform', `translate(${sublabelTranslateX},${sublabelTranslateY})`)
    .style('cursor', (d: SankeyNode<N, L>) => getString(d, config.labelCursor))

  const sublabelMaxWidth = isSublabelInline ? labelMaxWidth * config.subLabelToLabelInlineWidthRatio : labelMaxWidth
  if (config.labelFit === FitMode.Wrap || forceExpand) wrapSVGText(sublabelTextSelection, sublabelMaxWidth, separator)
  else wasTrimmed = trimSVGText(sublabelTextSelection, sublabelMaxWidth, config.labelTrimMode, fastEstimatesMode, subLabelFontSize, fontWidthToHeightRatio) || wasTrimmed

  labelGroup.classed(s.labelTrimmed, wasTrimmed)
  const sublabelSize = estimateTextSize(sublabelTextSelection, subLabelFontSize, dy, fastEstimatesMode, fontWidthToHeightRatio)

  // Draw the background if needed
  const labelGroupHeight = (isSublabelInline ? Math.max(labelSize.height, sublabelSize.height) : (labelSize.height + sublabelSize.height)) + 2 * labelPadding
  const labelBackground = labelGroup.select(`.${s.labelBackground}`)

  labelBackground
    .attr('d', () => {
      if (!labelShowBackground) return null
      const requiredLabelWidth = estimateRequiredLabelWidth(d, config, labelFontSize, subLabelFontSize)
      return getLabelBackground(Math.min(labelMaxWidth, requiredLabelWidth) + 2 * labelPadding, labelGroupHeight, labelOrientation as (Position.Left | Position.Right))
    })

  // Position the label
  const labelTextAnchor = getLabelTextAnchor(d, config, width)
  const sublabelTextAnchor = getSubLabelTextAnchor(d, config, width)
  const xTranslate = getLabelGroupXTranslate(d, config, width)
  const yTranslate = getLabelGroupYTranslate(d, labelGroupHeight, config)

  labelTextSelection.attr('text-anchor', labelTextAnchor)
  sublabelTextSelection.attr('text-anchor', sublabelTextAnchor)

  labelGroup.attr('transform', `translate(${xTranslate},${yTranslate})`)

  return {
    x: d.x0 + xTranslate,
    y: d.y0 + yTranslate,
    width: labelMaxWidth,
    height: labelGroupHeight,
    layer: d.layer,
    selection: labelGroup,
  }
}
