import { Selection } from 'd3-selection'
import { color } from 'd3-color'
import { Arc } from 'd3-shape'

// Utils
import { getColor, hexToBrightness } from 'utils/color'
import { smartTransition } from 'utils/d3'
import { getString } from 'utils/data'
import { cssvar } from 'utils/style'

// Config
import { NestedDonutConfig } from '../config'

// Local Types
import { NestedDonutSegment } from '../types'

// Styles
import { variables } from '../style'

function getLabelFillColor<Datum> (
  d: NestedDonutSegment<Datum>,
  config: NestedDonutConfig<Datum>
): string {
  const c = getColor(d, config.segmentColor, d._index, true)
  const colorParsed = color(c)
  const brightness = colorParsed ? hexToBrightness(colorParsed.hex()) : 0
  return cssvar(brightness > 0.65 ? variables.nestedDonutSegmentLabelTextColorLight : variables.nestedDonutSegmentLabelTextColorDark)
}

function getLabelTransform<Datum> (
  d: NestedDonutSegment<Datum>,
  arcGen: Arc<unknown, NestedDonutSegment<Datum>>
): string {
  const translate = `translate(${arcGen.centroid(d)})`
  if (!d._layer.rotateLabels) return translate
  const degree = 180 / Math.PI * (arcGen.startAngle()(d) + arcGen.endAngle()(d)) / 2 - 90
  return `${translate} rotate(${degree > 90 ? degree - 180 : degree})`
}

export function createLabel<Datum> (
  selection: Selection<SVGTextElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  config: NestedDonutConfig<Datum>
): void {
  selection
    .text(d => getString(d, config.segmentLabel) ?? d.data.key.toString())
    .style('opacity', 0)
}

export function updateLabel<Datum> (
  selection: Selection<SVGTextElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  config: NestedDonutConfig<Datum>,
  arcGen: Arc<unknown, NestedDonutSegment<Datum>>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 1)

  selection
    .text(d => getString(d, config.segmentLabel) ?? d.data.key.toString())
    .attr('transform', d => getLabelTransform(d, arcGen))
    .style('fill', d => getColor(d, config.segmentLabelColor) ?? getLabelFillColor(d, config))
}

export function removeLabel<Datum> (
  selection: Selection<SVGTextElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}


