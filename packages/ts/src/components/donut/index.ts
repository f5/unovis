import { Selection } from 'd3-selection'
import { pie, arc } from 'd3-shape'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { smartTransition } from 'utils/d3'
import { isNumber, clamp, getNumber } from 'utils/data'
import { wrapSVGText } from 'utils/text'

// Types
import { Spacing } from 'types/spacing'

// Local Types
import { DonutArcDatum, DonutArcAnimState, DonutDatum } from './types'

// Config
import { DonutDefaultConfig, DonutConfigInterface } from './config'

// Modules
import { createArc, updateArc, removeArc } from './modules/arc'

// Styles
import * as s from './style'

// Constants that support half donuts
export const DONUT_HALF_ANGLE_RANGES = Array.from({ length: 4 }, (_, i): [number, number] => {
  const offset = -Math.PI / 2 + i * Math.PI / 2
  return [offset, offset + Math.PI]
})

export const [
  DONUT_HALF_ANGLE_RANGE_TOP,
  DONUT_HALF_ANGLE_RANGE_RIGHT,
  DONUT_HALF_ANGLE_RANGE_BOTTOM,
  DONUT_HALF_ANGLE_RANGE_LEFT,
] = DONUT_HALF_ANGLE_RANGES

export class Donut<Datum> extends ComponentCore<Datum[], DonutConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = DonutDefaultConfig as DonutConfigInterface<Datum>
  public config: DonutConfigInterface<Datum> = this._defaultConfig

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()

  arcBackground: Selection<SVGPathElement, unknown, SVGGElement, unknown>
  arcGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  centralLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>
  centralSubLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>
  arcGen = arc<DonutArcAnimState>()

  events = {
  }

  constructor (config?: DonutConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.arcBackground = this.g.append('path')
    this.arcGroup = this.g.append('g')
    this.centralLabel = this.g.append('text')
      .attr('class', s.centralLabel)
    this.centralSubLabel = this.g.append('text')
      .attr('class', s.centralSubLabel)
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  _render (customDuration?: number): void {
    const { config, datamodel, bleed } = this

    // Wrap data to preserve original indices
    const data: DonutDatum<Datum>[] = datamodel.data
      .map((d, i) => ({
        index: i,
        datum: d,
      }))
      .filter(d => config.showEmptySegments || getNumber(d.datum, config.value, d.index))

    const duration = isNumber(customDuration) ? customDuration : config.duration

    // Handle half-donut cases, which adjust the scaling and positioning.
    // One of these is true if we are dealing with a half-donut.
    const [
      isHalfDonutTop,
      isHalfDonutRight,
      isHalfDonutBottom,
      isHalfDonutLeft,
    ] = DONUT_HALF_ANGLE_RANGES.map(angleRange =>
      config.angleRange && (
        config.angleRange[0] === angleRange[0] &&
        config.angleRange[1] === angleRange[1]
      )
    )
    const isVerticalHalfDonut = isHalfDonutTop || isHalfDonutBottom
    const isHorizontalHalfDonut = isHalfDonutRight || isHalfDonutLeft

    // Compute the bounding box of the donut,
    // considering it may be a half-donut
    const width = this._width * (isHorizontalHalfDonut ? 2 : 1)
    const height = this._height * (isVerticalHalfDonut ? 2 : 1)

    const outerRadius = config.radius || Math.min(width - bleed.left - bleed.right, height - bleed.top - bleed.bottom) / 2
    const innerRadius = config.arcWidth === 0 ? 0 : clamp(outerRadius - config.arcWidth, 0, outerRadius - 1)

    const translateY = this._height / 2 + (isHalfDonutTop ? outerRadius / 2 : isHalfDonutBottom ? -outerRadius / 2 : 0)
    const translateX = this._width / 2 + (isHalfDonutLeft ? outerRadius / 2 : isHalfDonutRight ? -outerRadius / 2 : 0)
    const translate = `translate(${translateX},${translateY})`

    this.arcGroup.attr('transform', translate)

    this.arcGen
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .innerRadius(d => d.innerRadius)
      .outerRadius(d => d.outerRadius)
      .padAngle(d => d.padAngle)
      .cornerRadius(config.cornerRadius)

    const pieGen = pie<DonutDatum<Datum>>()
      .startAngle(config.angleRange?.[0] ?? 0)
      .endAngle(config.angleRange?.[1] ?? 2 * Math.PI)
      .padAngle(config.padAngle)
      .value(d => getNumber(d.datum, config.value, d.index) || 0)
      .sort((a, b) => config.sortFunction?.(a.datum, b.datum))

    const arcData: DonutArcDatum<Datum>[] = pieGen(data).map(d => {
      const arc = {
        ...d,
        data: d.data.datum,
        index: d.data.index,
        innerRadius,
        outerRadius,
      }

      if (config.showEmptySegments && d.endAngle - d.startAngle - d.padAngle <= Number.EPSILON) {
        arc.endAngle = d.startAngle + Math.max(config.emptySegmentAngle, config.padAngle)
        arc.padAngle = d.padAngle / 2
      }
      return arc
    })

    // Arc segments
    const arcsSelection = this.arcGroup
      .selectAll<SVGPathElement, DonutArcDatum<Datum>>(`.${s.segment}`)
      .data(arcData, (d: DonutArcDatum<Datum>) => config.id(d.data, d.index))

    const arcsEnter = arcsSelection.enter().append('path')
      .attr('class', s.segment)
      .call(createArc, config)

    const arcsMerged = arcsSelection.merge(arcsEnter)
    arcsMerged.call(updateArc, config, this.arcGen, duration)
    arcsMerged.sort((a, b) => b.value - a.value)

    arcsSelection.exit<DonutArcDatum<Datum>>()
      .attr('class', s.segmentExit)
      .call(removeArc, duration)

    // Label
    const labelTextAnchor = isHalfDonutRight ? 'start' : isHalfDonutLeft ? 'end' : 'middle'
    this.centralLabel
      .attr('dy', config.centralSubLabel ? '-0.55em' : null)
      .style('text-anchor', labelTextAnchor)
      .text(config.centralLabel ?? null)

    this.centralSubLabel
      .attr('dy', config.centralLabel ? '0.55em' : null)
      .style('text-anchor', labelTextAnchor)
      .text(config.centralSubLabel ?? null)

    if (config.centralSubLabelWrap) wrapSVGText(this.centralSubLabel, innerRadius * 1.9)

    // Label placement
    const { centralLabelsOffsetX, centralLabelsOffsetY } = config
    const labelTranslateX = (centralLabelsOffsetX || 0) + translateX
    let labelTranslateY = (centralLabelsOffsetY || 0) + translateY

    // Special case label placement for half donut
    if (isVerticalHalfDonut && centralLabelsOffsetX === undefined && centralLabelsOffsetY === undefined) {
      const halfDonutLabelOffsetY = isHalfDonutTop
        ? -this.centralSubLabel.node().getBoundingClientRect().height
        : isHalfDonutBottom
          ? this.centralLabel.node().getBoundingClientRect().height
          : 0
      labelTranslateY = halfDonutLabelOffsetY + translateY
    }
    const labelTranslate = `translate(${labelTranslateX},${labelTranslateY})`
    this.centralLabel.attr('transform', labelTranslate)
    this.centralSubLabel.attr('transform', labelTranslate)

    // Background
    this.arcBackground.attr('class', s.background)
      .attr('visibility', config.showBackground ? null : 'hidden')
      .attr('transform', translate)

    smartTransition(this.arcBackground, duration)
      .attr('d', this.arcGen({
        startAngle: config.backgroundAngleRange?.[0] ?? config.angleRange?.[0] ?? 0,
        endAngle: config.backgroundAngleRange?.[1] ?? config.angleRange?.[1] ?? 2 * Math.PI,
        innerRadius,
        outerRadius,
      }))
  }
}
