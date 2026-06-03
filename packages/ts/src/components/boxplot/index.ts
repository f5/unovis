import { select, Selection } from 'd3-selection'
import { min, max } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, isEmpty, clamp, getString, getNumber, getValue, getExtent, getMin, getMax } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'

// Local Types
import { BoxplotDataRecord } from './types'

// Config
import { BoxplotDefaultConfig, BoxplotConfigInterface } from './config'

// Styles
import * as s from './style'

export class Boxplot<Datum> extends XYComponentCore<Datum, BoxplotConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = BoxplotDefaultConfig as BoxplotConfigInterface<Datum>
  public config: BoxplotConfigInterface<Datum> = this._defaultConfig

  events = {}
  private _boxData: Datum[] = []

  constructor (config?: BoxplotConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
  }

  get bleed (): Spacing {
    this._boxData = this._getVisibleData()
    if (this._boxData.length === 0) return { top: 0, bottom: 0, left: 0, right: 0 }

    const dataDomain = this.xScale.domain()
    const halfGroupWidth = this._getBarWidth() / 2

    const dataScaleValues = this._boxData.map((d, i) => getNumber(d, this.config.x, i))
    const firstDataValue = min(dataScaleValues)
    const lastDataValue = max(dataScaleValues)
    const firstValuePx = this.xScale(firstDataValue)
    const lastValuePx = this.xScale(lastDataValue)

    const dataDomainRequiredStart = this.xScale.invert(firstValuePx - halfGroupWidth)
    const dataDomainRequiredEnd = this.xScale.invert(lastValuePx + halfGroupWidth)
    const bleedPxStart = dataDomainRequiredStart <= dataDomain[0] ? this.xScale(dataDomain[0]) - this.xScale(dataDomainRequiredStart) : 0
    const bleedPxEnd = dataDomainRequiredEnd > dataDomain[1] ? this.xScale(dataDomainRequiredEnd) - this.xScale(dataDomain[1]) : 0

    const tolerance = 2 // Slightly increase bleed to take into account the stroke width
    return { top: 0, bottom: 0, left: bleedPxStart + tolerance, right: bleedPxEnd + tolerance }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const barWidth = this._getBarWidth()

    if (isEmpty(this._boxData)) this._boxData = this._getVisibleData()

    const boxData: BoxplotDataRecord<Datum>[] = this._boxData.map((d, i) => ({
      datum: d,
      index: i,
      median: getNumber(d, config.median, i),
      quartiles: getValue<Datum, [number, number]>(d, config.quartiles, i),
      whiskers: getValue<Datum, [number, number]>(d, config.whiskers, i),
    }))

    const boxGroups = this.g
      .selectAll<SVGGElement, BoxplotDataRecord<Datum>>(`.${s.boxGroup}`)
      .data(boxData, d => `${getString(d.datum, config.id, d.index) ?? d.index}`)

    const getBoxGroupTransform = (d: BoxplotDataRecord<Datum>): string =>
      `translate(${this.xScale(getNumber(d.datum, config.x, d.index))},0)`

    const boxGroupsEnter = boxGroups.enter().append('g')
      .attr('class', s.boxGroup)
      .attr('transform', getBoxGroupTransform)
      .style('opacity', 0) // Entering boxes fade in (see below); they're placed at their final geometry right away

    boxGroupsEnter.append('path').attr('class', s.box)
    boxGroupsEnter.append('line').attr('class', s.whisker).attr('data-end', 'lower')
    boxGroupsEnter.append('line').attr('class', s.whisker).attr('data-end', 'upper')
    boxGroupsEnter.append('line').attr('class', s.whiskerCap).attr('data-end', 'lower')
    boxGroupsEnter.append('line').attr('class', s.whiskerCap).attr('data-end', 'upper')
    boxGroupsEnter.append('line').attr('class', s.median)

    // Place entering boxes at their final geometry immediately (no positional animation),
    // so the only enter transition is the group's opacity fade-in below.
    boxGroupsEnter.each((d, i, elements) => {
      this._renderBox(select(elements[i]), d, barWidth, 0)
    })

    const boxGroupsMerged = boxGroupsEnter.merge(boxGroups)
    smartTransition(boxGroupsMerged, duration)
      .attr('transform', getBoxGroupTransform)
      .style('opacity', 1)

    // Animate geometry only for updating boxes; entering ones were already placed above.
    boxGroups.each((d, i, elements) => {
      this._renderBox(select(elements[i]), d, barWidth, duration)
    })

    const boxGroupsExit = boxGroups.exit()
      .attr('class', s.boxGroupExit)

    smartTransition(boxGroupsExit, duration)
      .style('opacity', 0)
      .remove()
      // `transition.remove()` only fires on `end`; if the transition is interrupted by a re-render,
      // the node would linger in the DOM with opacity < 1 and could be picked up by the next data join.
      .on('interrupt', function () { this.remove() })
  }

  private _renderBox (
    group: Selection<SVGGElement, BoxplotDataRecord<Datum>, null, undefined>,
    d: BoxplotDataRecord<Datum>,
    barWidth: number,
    duration: number
  ): void {
    const { config } = this
    const x = -barWidth / 2
    const capWidth = barWidth / 2

    // Each part renders from its own accessor. The median is just a line at a value, so it's fully
    // independent. The whiskers extend from the box edges (q1/q3), so they additionally need quartiles.
    // Use `Number.isFinite` (not the global `isFinite`): the global coerces first, so `isFinite(null)`
    // is `true` (because `Number(null) === 0`) — which would draw a phantom part for a `null` accessor
    // return. `Number.isFinite` is `true` only for an actual finite number.
    const hasQuartiles = Array.isArray(d.quartiles) && Number.isFinite(d.quartiles[0]) && Number.isFinite(d.quartiles[1])
    const hasMedian = Number.isFinite(d.median)
    const hasWhiskers = hasQuartiles && Array.isArray(d.whiskers) && Number.isFinite(d.whiskers[0]) && Number.isFinite(d.whiskers[1])

    // We toggle each part's visibility with a transitioned `opacity` rather than `display`, so a part
    // whose data disappears on update fades out (and is no longer shown), instead of leaving stale
    // geometry behind. Geometry is only updated when the part's data is present.

    // When the `color` accessor is set, it applies to every part — the box fill and stroke, the median
    // line, and the whiskers/caps. When it's not set, each part falls back to its own CSS variable
    // (`--vis-boxplot-fill-color`, `--vis-boxplot-stroke-color`, etc.) by clearing the inline style.
    const color = config.color ? getColor(d.datum, config.color, d.index) : null

    // Box (q1 -> q3)
    const boxSelection = group.select(`.${s.box}`)
      .style('fill', color)
      .style('stroke', color)
    const boxTransition = smartTransition(boxSelection, duration).style('opacity', hasQuartiles ? 1 : 0)
    if (hasQuartiles) {
      const yTop = this.yScale(d.quartiles[1])
      const yBottom = this.yScale(d.quartiles[0])
      const height = Math.abs(yBottom - yTop)
      const cornerRadius = config.roundedCorners
        ? isNumber(config.roundedCorners) ? +config.roundedCorners : barWidth / 2
        : 0
      const r = clamp(cornerRadius, 0, Math.min(height, barWidth) / 2)
      boxTransition
        .attr('d', roundedRectPath({ x, y: Math.min(yTop, yBottom), w: barWidth, h: height, tl: true, tr: true, bl: true, br: true, r }))
    }

    // Median line
    const medianTransition = smartTransition(group.select(`.${s.median}`).style('stroke', color), duration)
      .style('opacity', hasMedian ? 1 : 0)
    if (hasMedian) {
      const y = this.yScale(d.median)
      medianTransition.attr('x1', x).attr('x2', x + barWidth).attr('y1', y).attr('y2', y)
    }

    // Whiskers (min -> q1 and q3 -> max) and caps
    const yMin = hasWhiskers ? this.yScale(d.whiskers[0]) : 0
    const yMax = hasWhiskers ? this.yScale(d.whiskers[1]) : 0
    const yQ1 = hasQuartiles ? this.yScale(d.quartiles[0]) : 0
    const yQ3 = hasQuartiles ? this.yScale(d.quartiles[1]) : 0

    group.selectAll(`.${s.whisker}`).each((_, i, nodes) => {
      const node = select(nodes[i] as SVGLineElement).style('stroke', color)
      const isLower = node.attr('data-end') === 'lower'
      const t = smartTransition(node, duration).style('opacity', hasWhiskers ? 1 : 0)
      if (hasWhiskers) {
        t.attr('x1', 0).attr('x2', 0).attr('y1', isLower ? yQ1 : yQ3).attr('y2', isLower ? yMin : yMax)
      }
    })

    group.selectAll(`.${s.whiskerCap}`).each((_, i, nodes) => {
      const node = select(nodes[i] as SVGLineElement).style('stroke', color)
      const isLower = node.attr('data-end') === 'lower'
      const t = smartTransition(node, duration).style('opacity', hasWhiskers ? 1 : 0)
      if (hasWhiskers) {
        const y = isLower ? yMin : yMax
        t.attr('x1', -capWidth / 2).attr('x2', capWidth / 2).attr('y1', y).attr('y2', y)
      }
    })
  }

  _getBarWidth (): number {
    const { config, datamodel: { data } } = this
    if (isEmpty(data)) return 0
    if (config.barWidth) return min([config.barWidth, config.barMaxWidth])

    const domain = this.xScale.domain() as number[]
    const domainLength = domain[1] - domain[0]

    // Number of box slots across the domain. Use `dataStep` when set (needed when the data has missing
    // points, where the step can't be inferred); otherwise count the data points within the domain.
    let dataSize = (1 + domainLength / config.dataStep) ||
      data.filter((d, i) => {
        const v = getNumber(d, config.x, i)
        return (v >= domain[0]) && (v <= domain[1])
      }).length ||
      data.length

    // Reserve one extra slot so the boxes near the domain edges have room
    if (dataSize >= 2) dataSize += 1

    const c = dataSize < 2 ? 1 : 1 - config.barPadding
    const barWidth = c * this._width / dataSize

    return min([barWidth, config.barMaxWidth])
  }

  _getVisibleData (): Datum[] {
    const { config, datamodel: { data } } = this

    // We render a box only when its center (x value) falls within the domain. There's no need to
    // pull in boxes whose center lies outside the domain: the `bleed` getter already reserves enough
    // space for the half-width of the edge boxes, so they're never clipped.
    const domain = this.xScale.domain()
    const domainMin = +domain[0]
    const domainMax = +domain[1]
    return data?.filter((d, i) => {
      const v = getNumber(d, config.x, i)
      return (v >= domainMin) && (v <= domainMax)
    })
  }

  getValueScaleExtent (scaleByVisibleData: boolean): number[] {
    const { config, datamodel } = this
    const data = scaleByVisibleData ? this._getVisibleData() : datamodel.data
    const valueAccessors: NumericAccessor<Datum>[] = [
      config.median,
      (d, i) => getValue<Datum, [number, number]>(d, config.quartiles, i)?.[0],
      (d, i) => getValue<Datum, [number, number]>(d, config.quartiles, i)?.[1],
      (d, i) => getValue<Datum, [number, number]>(d, config.whiskers, i)?.[0],
      (d, i) => getValue<Datum, [number, number]>(d, config.whiskers, i)?.[1],
    ]
    return [getMin(data, ...valueAccessors), getMax(data, ...valueAccessors)]
  }

  getDataScaleExtent (): number[] {
    const { config, datamodel } = this
    return getExtent(datamodel.data, config.x)
  }

  getYDataExtent (scaleByVisibleData: boolean): number[] {
    return this.getValueScaleExtent(scaleByVisibleData)
  }

  getXDataExtent (): number[] {
    return this.getDataScaleExtent()
  }
}
