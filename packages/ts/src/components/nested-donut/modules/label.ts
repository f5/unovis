import { Selection, select } from 'd3-selection'
import { color } from 'd3-color'
import { Arc } from 'd3-shape'

// Utils
import { getColor, hexToBrightness } from 'utils/color'
import { smartTransition } from 'utils/d3'
import { getString } from 'utils/data'
import { getCSSVariableValueInPixels } from 'utils/misc'
import { cssvar } from 'utils/style'
import { wrapSVGText } from 'utils/text'

// Config
import { NestedDonutConfig } from '../config'

// Local Types
import { NestedDonutSegment, NestedDonutSegmentLabelAlignment } from '../types'

// Styles
import { variables } from '../style'

function getLabelFillColor<Datum> (
  d: NestedDonutSegment<Datum>,
  config: NestedDonutConfig<Datum>
): string {
  const c = getColor(d, config.segmentColor) ?? d._state.fill
  const colorParsed = color(c)
  const brightness = colorParsed ? hexToBrightness(colorParsed.hex()) : 0
  return cssvar(brightness > 0.65 ? variables.nestedDonutSegmentLabelTextColorLight : variables.nestedDonutSegmentLabelTextColorDark)
}

function getLabelTransform<Datum> (
  d: NestedDonutSegment<Datum>,
  arcGen: Arc<unknown, NestedDonutSegment<Datum>>
): string {
  const translate = `translate(${arcGen.centroid(d)})`
  const degree = 180 / Math.PI * (arcGen.startAngle()(d) + arcGen.endAngle()(d)) / 2 - 90
  switch (d._layer.labelAlignment) {
    case NestedDonutSegmentLabelAlignment.Along:
      return `${translate} rotate(${degree + 90})`
    case NestedDonutSegmentLabelAlignment.Perpendicular:
      return `${translate} rotate(${degree > 90 ? degree - 180 : degree})`
    default:
      return `${translate}`
  }
}

function getLabelBounds<Datum> (
  d: NestedDonutSegment<Datum>
): { width: number; height: number } {
  const arcWidth = d.y1 - d.y0
  const arcLength = d._layer._innerRadius * (d.x1 - d.x0)
  const bandwidth = Math.max(Math.abs(Math.cos(d.x0 + (d.x1 - d.x0) / 2 - Math.PI / 2) * arcWidth), arcWidth)
  switch (d._layer.labelAlignment) {
    case NestedDonutSegmentLabelAlignment.Perpendicular:
      return { width: arcWidth, height: arcLength }
    case NestedDonutSegmentLabelAlignment.Along:
      return { width: arcLength, height: arcWidth }
    case NestedDonutSegmentLabelAlignment.Straight:
      return { width: bandwidth, height: bandwidth }
  }
}

export function createLabel<Datum> (
  selection: Selection<SVGTextElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  arcGen: Arc<unknown, NestedDonutSegment<Datum>>
): void {
  selection
    .attr('transform', d => getLabelTransform(d, arcGen))
    .style('visibility', null)
    .style('opacity', 0)
}


export function updateLabel<Datum> (
  selection: Selection<SVGTextElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  config: NestedDonutConfig<Datum>,
  arcGen: Arc<unknown, NestedDonutSegment<Datum>>,
  duration: number
): void {
  selection
    .text(d => getString(d, config.segmentLabel) ?? d.data.key)
    .style('transition', `fill ${duration}ms`)
    .style('fill', d => getColor(d, config.segmentLabelColor) ?? getLabelFillColor(d, config))
    .each((d, i, els) => {
      const bounds = getLabelBounds(d)
      const label = select(els[i]).call(wrapSVGText, bounds.width)

      const { width, height } = label.node().getBBox()

      if (config.hideOverflowingSegmentLabels && (width > bounds.width || height > bounds.height) && 'hidden') {
        label.attr('visibility', 'hidden')
      } else {
        const fontSize = getCSSVariableValueInPixels(cssvar(variables.nestedDonutSegmentLabelFontSize), els[i])
        const len = label.selectChildren().size() - 1
        label.attr('dy', -fontSize / 2 * len)
      }
    })

  smartTransition(selection, duration)
    .attr('transform', d => getLabelTransform(d, arcGen))
    .style('opacity', 1)
}

export function removeLabel<Datum> (
  selection: Selection<SVGTextElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
