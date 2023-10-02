import { select, Selection } from 'd3-selection'
import { Position } from 'types/position'

// Utils
import { rectIntersect } from 'utils/misc'
import { estimateStringPixelLength } from 'utils/text'
import { getValue } from 'utils/data'

// Types
import { ContinuousScale } from 'types/scale'
import { Rect } from 'types/misc'

// Local Types
import { ScatterPoint, ScatterPointGroupNode } from '../types'

// Config
import { ScatterConfigInterface } from '../config'

export function isLabelPositionCenter (labelPosition: Position | `${Position}`): boolean {
  return (labelPosition !== Position.Top) && (labelPosition !== Position.Bottom) &&
  (labelPosition !== Position.Left) && (labelPosition !== Position.Right)
}

export function getCentralLabelFontSize (pointDiameter: number, textLength: number): number {
  return textLength ? 0.7 * pointDiameter / Math.pow(textLength, 0.5) : 0
}

export function getLabelShift (
  labelPosition: `${Position}`,
  pointDiameter: number,
  labelPadding = 5
): [number, number] {
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

export function getEstimatedLabelBBox<Datum> (
  d: ScatterPoint<Datum>,
  labelPosition: Position | `${Position}`,
  xScale: ContinuousScale,
  yScale: ContinuousScale,
  fontSizePx: number
): Rect {
  const x = xScale(d._point.xValue)
  const y = yScale(d._point.yValue)
  const pointDiameter = d._point.sizePx

  const pointLabelText = d._point.label ?? ''
  const textLength = pointLabelText.length
  const centralLabelFontSize = getCentralLabelFontSize(pointDiameter, textLength)

  const width = estimateStringPixelLength(pointLabelText, isLabelPositionCenter(labelPosition) ? centralLabelFontSize : fontSizePx, 0.6)
  const height = fontSizePx

  const labelShift = getLabelShift(labelPosition, pointDiameter)
  const dx = labelPosition === Position.Left ? -width
    : labelPosition === Position.Right ? 0 : -width / 2
  const dy = labelPosition === Position.Top ? -height
    : labelPosition === Position.Bottom ? 0 : -height / 2

  const bbox: Rect = {
    x: x + labelShift[0] + dx,
    y: y + labelShift[1] + dy,
    width: width,
    height: height,
  }

  return bbox
}

export function collideLabels<Datum> (
  selection: Selection<SVGGElement, ScatterPoint<Datum>, SVGGElement, ScatterPoint<Datum>[]>,
  config: ScatterConfigInterface<Datum>,
  xScale: ContinuousScale,
  yScale: ContinuousScale
): void {
  // Reset visibility of all labels
  selection.each((datum1: ScatterPoint<Datum>, i, elements) => {
    const node = elements[i] as ScatterPointGroupNode
    node._labelVisible = true
  })

  // Run collision detection and set labels visibility
  selection.each((datum1: ScatterPoint<Datum>, i, elements) => {
    const group1Node = elements[i] as ScatterPointGroupNode
    const label1Position = getValue(datum1, config.labelPosition, datum1._point.pointIndex)
    if (!group1Node._labelVisible || isLabelPositionCenter(label1Position as Position)) return

    const label1 = select<SVGGElement, ScatterPoint<Datum>>(group1Node).select<SVGTextElement>('text')
    const label1FontSize = Number.parseFloat(window.getComputedStyle(label1.node())?.fontSize)

    // Calculate bounding rect of point's label
    const label1BoundingRect = getEstimatedLabelBBox(datum1, label1Position as Position, xScale, yScale, label1FontSize)

    for (let j = 0; j < elements.length; j += 1) {
      if (i === j) continue
      const group2Node = elements[j] as ScatterPointGroupNode
      const group2 = select<SVGGElement, ScatterPoint<Datum>>(group2Node)
      const label2 = group2.select<SVGTextElement>('text')
      const datum2 = group2.datum()

      // Calculate bounding rect of the second point's circle
      const p2Pos = [xScale(datum2._point.xValue), yScale(datum2._point.yValue)]
      const p2Radius = datum2._point.sizePx / 2
      const point2BoundingRect = {
        x: p2Pos[0] - p2Radius,
        y: p2Pos[1] - p2Radius,
        width: 2 * p2Radius,
        height: 2 * p2Radius,
      }

      let intersect = rectIntersect(label1BoundingRect, point2BoundingRect, 2)

      // If there's no intersection, check for collision with the second point's label
      const label2Visible = group2Node._labelVisible
      if (!intersect && label2Visible) {
        const label2FontSize = Number.parseFloat(window.getComputedStyle(label2.node())?.fontSize)
        const label2Position = getValue(datum2, config.labelPosition, datum2._point.pointIndex)
        const label2BoundingRect = getEstimatedLabelBBox(datum2, label2Position as Position, xScale, yScale, label2FontSize)

        intersect = rectIntersect(label1BoundingRect, label2BoundingRect, 0.25)
      }

      if (intersect) {
        if (group1Node._forceShowLabel) group2Node._labelVisible = false
        else {
          group1Node._labelVisible = false
          break
        }
      }
    }
  })

  // Hide the overlapping labels
  selection.each((datum1: ScatterPoint<Datum>, i, elements) => {
    const node = elements[i] as ScatterPointGroupNode
    const label = select<SVGGElement, ScatterPoint<Datum>>(node).select<SVGTextElement>('text')
    label.attr('opacity', node._labelVisible ? 1 : 0)
  })
}
