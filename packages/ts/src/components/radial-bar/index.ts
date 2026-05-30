import { Selection } from 'd3-selection'
import { arc } from 'd3-shape'
import { max } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { smartTransition } from 'utils/d3'
import { isNumber, clamp, getNumber } from 'utils/data'
import { getCSSVariableValueInPixels } from 'utils/misc'
import { cssvar } from 'utils/style'
import { wrapSVGText } from 'utils/text'

// Types
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'

// Local Types
import { RadialBarArcDatum, RadialBarArcAnimState, RadialBarDatum } from './types'

// Config
import { RadialBarDefaultConfig, RadialBarConfigInterface } from './config'

// Modules
import { createBar, updateBar, removeBar } from './modules/bar'

// Utils
import { getArcUnitBoundingBox } from './utils'

// Styles
import * as s from './style'

export class RadialBar<Datum> extends ComponentCore<Datum[], RadialBarConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = RadialBarDefaultConfig as RadialBarConfigInterface<Datum>
  public config: RadialBarConfigInterface<Datum> = this._defaultConfig

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()

  trackGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  barGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  centralLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>
  centralSubLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>
  arcGen = arc<RadialBarArcAnimState>()

  events = {
  }

  constructor (config?: RadialBarConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.trackGroup = this.g.append('g')
    this.barGroup = this.g.append('g')
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

    // Wrap data to preserve original indices and resolve values once
    const wrapped: RadialBarDatum<Datum>[] = datamodel.data
      .map((d, i) => ({ index: i, datum: d }))

    if (config.sortFunction) {
      wrapped.sort((a, b) => config.sortFunction(a.datum, b.datum))
    }

    const duration = isNumber(customDuration) ? customDuration : config.duration

    // Compute geometry
    const width = this._width
    const height = this._height
    const availW = width - bleed.left - bleed.right
    const availH = height - bleed.top - bleed.bottom

    const startAngle = config.angleRange?.[0] ?? 0
    const endAngle = config.angleRange?.[1] ?? 2 * Math.PI
    const angleRange = endAngle - startAngle

    const unitBBox = getArcUnitBoundingBox(startAngle, endAngle)
    const bboxW = unitBBox.xMax - unitBBox.xMin
    const bboxH = unitBBox.yMax - unitBBox.yMin
    const outerRadius = config.radius ?? Math.min(availW / bboxW, availH / bboxH)

    const bboxCx = (unitBBox.xMin + unitBBox.xMax) / 2
    const bboxCy = (unitBBox.yMin + unitBBox.yMax) / 2
    const translateX = bleed.left + availW / 2 - bboxCx * outerRadius
    const translateY = bleed.top + availH / 2 - bboxCy * outerRadius

    const n = wrapped.length
    const trackWidth = Math.max(0, config.trackWidth)
    const trackPadding = Math.max(0, config.trackPadding)
    const totalRings = trackWidth * n + trackPadding * Math.max(0, n - 1)

    // If totalRings exceeds outerRadius, clamp the ring layout to fit.
    const ringStride = totalRings > outerRadius
      ? outerRadius / Math.max(1, n)
      : trackWidth + trackPadding
    const effectiveTrackWidth = totalRings > outerRadius
      ? clamp(ringStride - trackPadding, 1, ringStride)
      : trackWidth

    // Resolve per-bar value and max
    const values = wrapped.map((d) => getNumber(d.datum, config.value, d.index) ?? 0)
    const dataMax = max(values) ?? 0
    const maxValues = wrapped.map((d) => {
      const mv = config.maxValue
      if (Array.isArray(mv)) {
        const v = mv[d.index]
        return (isNumber(v) ? v : dataMax) || 1
      }
      const resolved = getNumber(d.datum, mv as NumericAccessor<Datum>, d.index)
      return (resolved ?? dataMax) || 1
    })

    // Build arc datums per ring
    const arcData: RadialBarArcDatum<Datum>[] = wrapped.map((d, i) => {
      const ringIndex = config.reverseOrder ? (n - 1 - i) : i
      const outer = outerRadius - ringIndex * ringStride
      const inner = clamp(outer - effectiveTrackWidth, 0, outer - 1)

      const value = values[i]
      const perMax = maxValues[i]
      const fraction = clamp(value / perMax, 0, 1)

      return {
        data: d.datum,
        index: d.index,
        ringIndex,
        value,
        startAngle,
        endAngle: startAngle + fraction * angleRange,
        innerRadius: inner,
        outerRadius: outer,
        padAngle: config.padAngle,
      }
    })

    const translate = `translate(${translateX},${translateY})`

    this.barGroup.attr('transform', translate)
    this.trackGroup.attr('transform', translate)

    this.arcGen
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .innerRadius(d => d.innerRadius)
      .outerRadius(d => d.outerRadius)
      .padAngle(d => d.padAngle)
      .cornerRadius(config.cornerRadius)

    // Background tracks
    const bgAngleStart = config.backgroundAngleRange?.[0] ?? startAngle
    const bgAngleEnd = config.backgroundAngleRange?.[1] ?? endAngle
    const tracksSelection = this.trackGroup
      .selectAll<SVGPathElement, RadialBarArcDatum<Datum>>(`.${s.background}`)
      .data(config.showBackground ? arcData : [], (d: RadialBarArcDatum<Datum>) => config.id(d.data, d.index))

    const tracksEnter = tracksSelection.enter().append('path')
      .attr('class', s.background)
      .style('opacity', 0)

    const tracksMerged = tracksSelection.merge(tracksEnter)
    smartTransition(tracksMerged, duration)
      .style('opacity', 1)
      .attr('d', (d: RadialBarArcDatum<Datum>) => this.arcGen({
        startAngle: bgAngleStart,
        endAngle: bgAngleEnd,
        innerRadius: d.innerRadius,
        outerRadius: d.outerRadius,
        padAngle: d.padAngle,
      }))

    smartTransition(tracksSelection.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Bars
    const barsSelection = this.barGroup
      .selectAll<SVGPathElement, RadialBarArcDatum<Datum>>(`.${s.bar}`)
      .data(arcData, (d: RadialBarArcDatum<Datum>) => config.id(d.data, d.index))

    const barsEnter = barsSelection.enter().append('path')
      .attr('class', s.bar)
      .call(createBar, config)

    const barsMerged = barsSelection.merge(barsEnter)
    barsMerged.call(updateBar, config, this.arcGen, duration)

    barsSelection.exit<RadialBarArcDatum<Datum>>()
      .attr('class', s.barExit)
      .call(removeBar, duration)

    const innermostInnerRadius = arcData.length
      ? Math.min(...arcData.map(d => d.innerRadius))
      : outerRadius
    this._renderCentralLabels(translateX, translateY, innermostInnerRadius)
  }

  private _renderCentralLabels (translateX: number, translateY: number, innermostInnerRadius: number): void {
    const { config } = this

    this.centralLabel.text(config.centralLabel ?? null)
    this.centralSubLabel.text(config.centralSubLabel ?? null)

    if (config.centralSubLabelWrap) wrapSVGText(this.centralSubLabel, innermostInnerRadius * 1.9)

    // Center the labels block geometrically. We resolve font sizes from CSS variables
    // (cached, no layout reflow) and compute explicit `y` for each label, instead of
    // using `dy` in `em` which would bias the block's midline by
    // 0.275 * (centralSubLabelFontSize - centralLabelFontSize).
    const hasCentralLabel = !!config.centralLabel
    const hasCentralSubLabel = !!config.centralSubLabel

    const centralLabelFontSize = hasCentralLabel
      ? getCSSVariableValueInPixels(cssvar(s.variables.radialBarCentralLabelFontSize), this.element)
      : 0
    const centralSubLabelFontSize = hasCentralSubLabel
      ? getCSSVariableValueInPixels(cssvar(s.variables.radialBarCentralSubLabelFontSize), this.element)
      : 0

    const centralSubLabelTspanCount = this.centralSubLabel.node().childElementCount
    const centralSubLabelLineCount = centralSubLabelTspanCount || (hasCentralSubLabel ? 1 : 0)
    const centralSubLabelLineHeight = centralSubLabelFontSize * 1.2 // matches wrapSVGText's dy='1.2em'
    const centralSubLabelBlockHeight = centralSubLabelLineCount > 0
      ? centralSubLabelFontSize + (centralSubLabelLineCount - 1) * centralSubLabelLineHeight
      : 0
    const centralLabelsGap = hasCentralLabel && hasCentralSubLabel ? centralSubLabelFontSize * 0.25 : 0
    const centralLabelsTotalHeight = (hasCentralLabel ? centralLabelFontSize : 0) + centralLabelsGap + centralSubLabelBlockHeight

    const centralLabelY = -centralLabelsTotalHeight / 2 + centralLabelFontSize / 2
    const centralSubLabelY = -centralLabelsTotalHeight / 2 +
      (hasCentralLabel ? centralLabelFontSize + centralLabelsGap : 0) +
      centralSubLabelFontSize / 2

    this.centralLabel.attr('y', hasCentralLabel ? centralLabelY : null).attr('dy', null)
    this.centralSubLabel.attr('y', hasCentralSubLabel ? centralSubLabelY : null).attr('dy', null)

    const centralLabelsTranslateX = (config.centralLabelOffsetX || 0) + translateX
    const centralLabelsTranslateY = (config.centralLabelOffsetY || 0) + translateY
    const centralLabelsTransform = `translate(${centralLabelsTranslateX},${centralLabelsTranslateY})`
    this.centralLabel.attr('transform', centralLabelsTransform)
    this.centralSubLabel.attr('transform', centralLabelsTransform)
  }
}
