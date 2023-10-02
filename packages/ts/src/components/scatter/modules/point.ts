import { select, Selection } from 'd3-selection'
import { symbol } from 'd3-shape'
import { color } from 'd3-color'
import { Position } from 'types/position'
import { Symbol } from 'types/symbol'

// Utils
import { smartTransition } from 'utils/d3'
import { getCSSVariableValue, isStringCSSVariable } from 'utils/misc'
import { hexToBrightness } from 'utils/color'
import { getValue } from 'utils/data'

// Types
import { ContinuousScale } from 'types/scale'

// Config
import { ScatterConfigInterface } from '../config'

// Local Types
import { ScatterPoint } from '../types'

// Local Utils
import { getCentralLabelFontSize, getLabelShift } from './utils'

export function createPoints<Datum> (
  selection: Selection<SVGGElement, ScatterPoint<Datum>, SVGGElement, ScatterPoint<Datum>[]>,
  xScale: ContinuousScale,
  yScale: ContinuousScale
): void {
  selection.attr('transform', d => `translate(${d._point.xValue},${d._point.yValue})`)
  selection.append('path').style('fill', d => d._point.color)
  selection.append('text')
    .style('pointer-events', 'none')

  selection.attr('transform', d => `translate(${xScale(d._point.xValue)},${yScale(d._point.yValue)}) scale(0)`)
}

export function updatePoints<Datum> (
  selection: Selection<SVGGElement, ScatterPoint<Datum>, SVGGElement, ScatterPoint<Datum>[]>,
  config: ScatterConfigInterface<Datum>,
  xScale: ContinuousScale,
  yScale: ContinuousScale,
  duration: number
): void {
  const symbolGenerator = symbol()

  selection.each((d, index, elements) => {
    const i = d._point.pointIndex
    const group: Selection<SVGGElement, ScatterPoint<Datum>, SVGGElement, ScatterPoint<Datum>[]> = select(elements[index])
    const label = group.select('text')
    const path = group.select('path')

    // Shape
    const pointDiameter = d._point.sizePx
    const pointColor = d._point.color
    const pointStrokeColor = d._point.strokeColor ?? null
    const pointStrokeWidth = d._point.strokeWidthPx ?? null
    path.attr('d', () => {
      const svgPath = d._point.shape ? symbolGenerator
        .size(Math.PI * pointDiameter * pointDiameter / 4)
        .type(Symbol[d._point.shape])() : null
      return svgPath
    })

    smartTransition(path, duration)
      .style('fill', pointColor)
      .style('stroke', pointStrokeColor)
      .style('stroke-width', `${pointStrokeWidth}px`)

    // Label
    const labelPosition = getValue(d, config.labelPosition, i) as `${Position}`
    const isLabelPositionCenter = (labelPosition !== Position.Top) && (labelPosition !== Position.Bottom) &&
      (labelPosition !== Position.Left) && (labelPosition !== Position.Right)
    const pointLabelText = d._point.label ?? ''
    const textLength = pointLabelText.length
    const centralLabelFontSize = getCentralLabelFontSize(pointDiameter, textLength)

    let labelColor = d._point.labelColor
    if (!labelColor && isLabelPositionCenter) {
      const c = pointColor || 'var(--vis-scatter-fill-color)'
      const hex = color(isStringCSSVariable(c) ? getCSSVariableValue(c, group.node()) : c)?.hex()
      const brightness = hexToBrightness(hex)
      labelColor = brightness > config.labelTextBrightnessRatio ? 'var(--vis-scatter-point-label-text-color-dark)' : 'var(--vis-scatter-point-label-text-color-light)'
    }

    const labelShift = getLabelShift(labelPosition, pointDiameter)
    label.html(pointLabelText)
      .attr('x', labelShift[0])
      .attr('y', labelShift[1])
      .style('font-size', isLabelPositionCenter ? centralLabelFontSize : null)
      .style('text-anchor', () => {
        switch (labelPosition) {
          case Position.Right: return null
          case Position.Left: return 'end'
          default: return 'middle'
        }
      })
      .style('dominant-baseline', () => {
        switch (labelPosition) {
          case Position.Top: return null
          case Position.Bottom: return 'hanging'
          default: return 'central'
        }
      })

    smartTransition(label, duration)
      .style('fill', labelColor)

    path.style('cursor', d._point.cursor)
  })

  smartTransition(selection, duration)
    .attr('transform', d => `translate(${xScale(d._point.xValue)},${yScale(d._point.yValue)}) scale(1)`)
}

export function removePoints<Datum> (
  selection: Selection<SVGGElement, ScatterPoint<Datum>, SVGGElement, ScatterPoint<Datum>[]>,
  xScale: ContinuousScale,
  yScale: ContinuousScale,
  duration: number
): void {
  smartTransition(selection, duration)
    .attr('transform', d => `translate(${xScale(d._point.xValue)},${yScale(d._point.yValue)}) scale(0)`)
    .remove()
}

