import { Selection, select } from 'd3-selection'
import { mean } from 'd3-array'
import { color } from 'd3-color'

// Utils
import { smartTransition } from 'utils/d3'
import { getCSSVariableValueInPixels, getCSSVariableValue, isStringCSSVariable } from 'utils/misc'
import { getColor, hexToBrightness } from 'utils/color'
import { getNumber, getString, getValue } from 'utils/data'

// Types
import { ContinuousScale } from 'types/scale'

// Config
import { XYLabelsConfigInterface } from '../config'

// Local Types
import { XYLabel, XYLabelCluster, XYLabelPositioning, XYLabelRenderProps } from '../types'

export function createLabels<Datum> (
  selection: Selection<SVGGElement, XYLabel<Datum> | XYLabelCluster<Datum>, any, any>
): void {
  selection.attr('transform', d => `translate(${d._screen.x},${d._screen.y})`)
  selection.append('rect').style('fill', d => d._screen.backgroundColor)
  selection.append('text')
    .style('text-anchor', 'middle')
    .style('dominant-baseline', 'central')
    .style('fill', d => d._screen.backgroundColor)
    .style('pointer-events', 'none')

  selection.attr('transform', d => `translate(${d._screen.x},${d._screen.y}) scale(0)`)
}

export function updateLabels<Datum> (
  selection: Selection<SVGGElement, XYLabel<Datum> | XYLabelCluster<Datum>, any, any>,
  config: XYLabelsConfigInterface<Datum>,
  duration: number
): void {
  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, XYLabel<Datum> | XYLabelCluster<Datum>, any, any> = select(elements[i])
    const text = group.select('text')
    const rect = group.select('rect')

    const backgroundColor = d._screen.backgroundColor
    const labelText = d._screen.labelText ?? ''
    const labelFontSize = d._screen.fontSize
    let labelColor = d._screen.labelColor

    // Label background
    const backgroundHeight = labelFontSize * 1.7
    let backgroundWidth = labelFontSize * labelText.length * 0.7
    if (backgroundWidth < backgroundHeight) backgroundWidth = backgroundHeight
    smartTransition(rect, duration)
      .attr('width', backgroundWidth)
      .attr('height', backgroundHeight)
      .attr('x', -backgroundWidth / 2)
      .attr('y', -backgroundHeight / 2)
      .attr('rx', labelFontSize)
      .attr('ry', labelFontSize)
      .style('fill', backgroundColor)

    // Label
    if (!labelColor) {
      const hex = color(isStringCSSVariable(backgroundColor) ? getCSSVariableValue(backgroundColor, group.node()) : backgroundColor)?.hex()
      const brightness = hexToBrightness(hex)
      labelColor = brightness > config.labelTextBrightnessRatio
        ? 'var(--vis-xy-label-text-color-dark)'
        : 'var(--vis-xy-label-text-color-light)'
    }

    text.html(labelText)
      .attr('font-size', labelFontSize)

    smartTransition(text, duration)
      .style('fill', labelColor)

    rect.style('cursor', d._screen.cursor)
  })

  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._screen.x},${d._screen.y}) scale(1)`)
}

export function removeLabels<Datum> (
  selection: Selection<SVGGElement, XYLabel<Datum> | XYLabelCluster<Datum>, any, any>,
  duration: number
): void {
  smartTransition(selection, duration)
    .attr('transform', d => `translate(${d._screen.x},${d._screen.y}) scale(0)`)
    .remove()
}

export function getLabelPosition (value: number, positioning: XYLabelPositioning, scale: ContinuousScale): number {
  switch (positioning) {
    case XYLabelPositioning.DataSpace: return scale(value) ?? 0
    case XYLabelPositioning.AbsolutePx: return value
    case XYLabelPositioning.AbsolutePercentage: {
      const scaleRange = scale.range()
      return scaleRange[0] + (scaleRange[1] - scaleRange[0]) * value / 100
    }
  }
}

export function getLabelRenderProps<Datum> (
  data: Datum | XYLabel<Datum>[],
  el: SVGGraphicsElement,
  config: XYLabelsConfigInterface<Datum>,
  xScale: ContinuousScale,
  yScale: ContinuousScale
): XYLabelRenderProps {
  const isCluster = Array.isArray(data)
  const fontSize = isCluster
    ? (getNumber(data as XYLabel<Datum>[], config.clusterFontSize) ?? getCSSVariableValueInPixels('var(--vis-xy-label-cluster-font-size)', el))
    : (getNumber(data as Datum, config.labelFontSize) ?? getCSSVariableValueInPixels('var(--vis-xy-label-font-size)', el))

  const labelText = (isCluster ? getString(data as XYLabel<Datum>[], config.clusterLabel) : getString(data as Datum, config.label)) || ''
  const backgroundHeight = fontSize * 1.7
  let backgroundWidth = fontSize * labelText.length * 0.7
  if (backgroundWidth < backgroundHeight) backgroundWidth = backgroundHeight

  const x = isCluster
    ? mean(data as XYLabel<Datum>[], d => d._screen.x)
    : getLabelPosition(getNumber(data as Datum, config.x), getValue<Datum, XYLabelPositioning>(data as Datum, config.xPositioning), xScale)

  const y = isCluster
    ? mean(data as XYLabel<Datum>[], d => d._screen.y)
    : getLabelPosition(getNumber(data as Datum, config.y), getValue<Datum, XYLabelPositioning>(data as Datum, config.yPositioning), yScale)

  return {
    x,
    y,
    fontSize,
    labelText,
    labelColor: isCluster ? getColor(data as XYLabel<Datum>[], config.clusterLabelColor) : getColor(data as Datum, config.color),
    backgroundColor: isCluster ? getColor(data as XYLabel<Datum>[], config.clusterBackgroundColor) : getColor(data as Datum, config.backgroundColor),
    cursor: isCluster ? getString(data as XYLabel<Datum>[], config.clusterCursor) : getString(data as Datum, config.cursor),
    width: backgroundWidth,
    height: backgroundHeight,
  }
}
