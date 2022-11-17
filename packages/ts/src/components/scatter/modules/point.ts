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
import { ScatterConfig } from '../config'

// Local Types
import { ScatterPoint } from '../types'

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
  config: ScatterConfig<Datum>,
  xScale: ContinuousScale,
  yScale: ContinuousScale,
  duration: number
): void {
  const symbolGenerator = symbol()

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, ScatterPoint<Datum>, SVGGElement, ScatterPoint<Datum>[]> = select(elements[i])
    const label = group.select('text')
    const path = group.select('path')

    // Shape
    const pointDiameter = d._point.sizePx
    const pointColor = d._point.color
    path.attr('d', () => {
      const svgPath = d._point.shape ? symbolGenerator
        .size(Math.PI * pointDiameter * pointDiameter / 4)
        .type(Symbol[d._point.shape])() : null
      return svgPath
    })

    smartTransition(path, duration)
      .style('fill', pointColor)
      .style('stroke', pointColor)

    // Label
    const labelPosition = getValue(d, config.labelPosition, i) as `${Position}`
    const isLabelPositionCenter = (labelPosition !== Position.Top) && (labelPosition !== Position.Bottom) &&
      (labelPosition !== Position.Left) && (labelPosition !== Position.Right)
    const pointLabelText = d._point.label ?? ''
    const textLength = pointLabelText.length
    const pointLabelFontSize = 0.7 * pointDiameter / Math.pow(textLength, 0.4)

    let labelColor = d._point.labelColor
    if (!labelColor && isLabelPositionCenter) {
      const c = pointColor || 'var(--vis-scatter-fill)'
      const hex = color(isStringCSSVariable(c) ? getCSSVariableValue(c, group.node()) : c)?.hex()
      const brightness = hexToBrightness(hex)
      labelColor = brightness > config.labelTextBrightnessRatio ? 'var(--vis-scatter-point-label-text-color-dark)' : 'var(--vis-scatter-point-label-text-color-light)'
    }

    const getPos = (labelPosition: `${Position}`, labelPadding = 5): [number, number] => {
      switch (labelPosition) {
        case Position.Top:
          return [0, -pointDiameter / 2 - labelPadding]
        case Position.Bottom:
          return [0, pointDiameter / 2 + labelPadding]
        case Position.Left:
          return [-pointDiameter / 2 - labelPadding, 0]
        case Position.Right:
          return [pointDiameter / 2 + labelPadding, 0]
        default:
          return [0, 0]
      }
    }

    const pos = getPos(labelPosition)
    label.html(pointLabelText)
      .attr('x', pos[0])
      .attr('y', pos[1])
      .style('font-size', isLabelPositionCenter ? pointLabelFontSize : null)
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