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
    const outerRadius = config.radius || Math.min(this._width - bleed.left - bleed.right, this._height - bleed.top - bleed.bottom) / 2
    const innerRadius = config.arcWidth === 0 ? 0 : clamp(outerRadius - config.arcWidth, 0, outerRadius - 1)

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
      .sort((a, b) => config.sortFunction(a.datum, b.datum))

    this.arcGroup.attr('transform', `translate(${this._width / 2},${this._height / 2})`)

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
    this.centralLabel
      .attr('transform', `translate(${this._width / 2},${this._height / 2})`)
      .attr('dy', config.centralSubLabel ? '-0.55em' : null)
      .text(config.centralLabel ?? null)

    this.centralSubLabel
      .attr('transform', `translate(${this._width / 2},${this._height / 2})`)
      .attr('dy', config.centralLabel ? '0.55em' : null)
      .text(config.centralSubLabel ?? null)

    if (config.centralSubLabelWrap) wrapSVGText(this.centralSubLabel, innerRadius * 1.9)

    // Background
    this.arcBackground.attr('class', s.background)
      .attr('visibility', config.showBackground ? null : 'hidden')
      .attr('transform', `translate(${this._width / 2},${this._height / 2})`)

    smartTransition(this.arcBackground, duration)
      .attr('d', this.arcGen({
        startAngle: config.backgroundAngleRange?.[0] ?? config.angleRange?.[0] ?? 0,
        endAngle: config.backgroundAngleRange?.[1] ?? config.angleRange?.[1] ?? 2 * Math.PI,
        innerRadius,
        outerRadius,
      }))
  }
}
