import { Selection, select } from 'd3-selection'
import { color } from 'd3-color'
import { Arc } from 'd3-shape'

// Utils
import { UNOVIS_TEXT_DEFAULT } from 'styles'
import { getColor, hexToBrightness } from 'utils/color'
import { smartTransition } from 'utils/d3'
import { getString } from 'utils/data'
import { cssvar } from 'utils/style'
import { estimateTextSize, wrapSVGText } from 'utils/text'

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
  if (!d._layer.rotateLabels) return translate
  const degree = 180 / Math.PI * (arcGen.startAngle()(d) + arcGen.endAngle()(d)) / 2 - 90
  return `${translate} rotate(${degree > 90 ? degree - 180 : degree})`
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
    .text(d => getString(d, config.segmentLabel) ?? d.data.key.toString())
    .style('visibility', (d, i, els) => {
      const { width, height } = estimateTextSize(select(els[i]), UNOVIS_TEXT_DEFAULT.fontSize)
      const diff = (d.x1 - d.x0) * 180 / Math.PI
      if (!config.hideSegmentLabels) {
        wrapSVGText(select(els[i]), diff)
        return
      }
      const outOfBounds = d._layer.rotateLabels
        ? height < diff && width < (d.y1 - d.y0)
        : width >= diff
      return outOfBounds ? 'hidden' : null
    })
    .style('transition', `fill ${duration}ms`)
    .style('fill', d => getColor(d, config.segmentLabelColor) ?? getLabelFillColor(d, config))

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
