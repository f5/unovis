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
import { VerticalAlign } from 'types/text'

// Local Types
import { DonutArcDatum, DonutArcAnimState } from './types'

// Config
import { DonutConfig, DonutConfigInterface } from './config'

// Modules
import { createArc, updateArc, removeArc } from './modules/arc'

// Styles
import * as s from './style'

export class Donut<Datum> extends ComponentCore<Datum[], DonutConfig<Datum>, DonutConfigInterface<Datum>> {
  static selectors = s
  config: DonutConfig<Datum> = new DonutConfig()
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
    if (config) this.config.init(config)
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
    const data = datamodel.data
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const outerRadius = config.radius || Math.min(this._width - bleed.left - bleed.right, this._height - bleed.top - bleed.bottom) / 2
    const innerRadius = config.arcWidth === 0 ? 0 : clamp(outerRadius - config.arcWidth, 0, outerRadius - 1)

    this.arcGen
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .innerRadius(d => d.innerRadius)
      .outerRadius(d => d.outerRadius)
      .padAngle(config.padAngle)
      .cornerRadius(d => config.cornerRadius)

    const pieGen = pie<Datum>()
      .startAngle(config.angleRange[0] ?? 0)
      .endAngle(config.angleRange[1] ?? 2 * Math.PI)
      .padAngle(config.padAngle)
      .value((d, i) => getNumber(d, config.value, i) || (config.preventEmptySegments && Number.EPSILON) || 0)
      .sort(config.sortFunction)

    this.arcGroup.attr('transform', `translate(${this._width / 2},${this._height / 2})`)
    const arcData = pieGen(data) as DonutArcDatum<Datum>[]
    arcData.forEach(d => {
      d.innerRadius = innerRadius
      d.outerRadius = outerRadius
    })

    // Arc segments
    const arcsSelection = this.arcGroup
      .selectAll(`.${s.segment}`)
      .data(arcData, (d: DonutArcDatum<Datum>, i) => config.id(d.data, i))

    const arcsEnter = arcsSelection.enter().append('path')
      .attr('class', s.segment)
      .call(createArc, config)

    const arcsMerged = arcsSelection.merge(arcsEnter)
    arcsMerged.call(updateArc, config, this.arcGen, duration)

    arcsSelection.exit()
      .attr('class', s.segmentExit)
      .call(removeArc, duration)

    // Label
    this.centralLabel
      .attr('transform', `translate(${this._width / 2},${this._height / 2})`)
      .attr('dy', config.centralSubLabel ? '-0.55em' : null)
      .text(config.centralLabel ?? null)

    this.centralSubLabel
      .attr('transform', `translate(${this._width / 2},${this._height / 2})`)
      .attr('dy', config.centralLabel ? '0.55em' : null)
      .text(config.centralSubLabel ?? null)

    if (config.centralSubLabelWrap) wrapSVGText(this.centralSubLabel, { width: innerRadius * 1.9, verticalAlign: VerticalAlign.Top })

    // Background
    this.arcBackground.attr('class', s.background)
      .attr('visibility', config.showBackground ? null : 'hidden')
      .attr('transform', `translate(${this._width / 2},${this._height / 2})`)

    smartTransition(this.arcBackground, duration)
      .attr('d', this.arcGen({
        startAngle: 0,
        endAngle: 2 * Math.PI,
        innerRadius,
        outerRadius
      }))
  }
}
