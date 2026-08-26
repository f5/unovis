import { min, max } from 'd3-array'

// Core
import { XYComponentCore } from '@/core/xy-component'

// Utils
import { isNumber, isArray, isEmpty, clamp, getStackedExtentWithBaseline, getString, getNumber, getStackedData, getExtent } from '@/utils/data'
import { roundedRectPath } from '@/utils/path'
import { smartTransition } from '@/utils/d3'
import { getColor } from '@/utils/color'
import { getPattern, getFillPatternValue, UNOVIS_PATTERN_INDEX_ATTR } from '@/utils/pattern'

// Types
import { ContinuousScale } from '@/types/scale'
import { NumericAccessor } from '@/types/accessor'
import { Spacing } from '@/types/spacing'
import { Orientation } from '@/types/position'

// Local Types
import { StackedBarDataRecord } from './types'

// Config
import { StackedBarDefaultConfig, StackedBarConfigInterface } from './config'

// Styles
import * as s from './style'

export class StackedBar<Datum> extends XYComponentCore<Datum, StackedBarConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = StackedBarDefaultConfig as StackedBarConfigInterface<Datum>
  public config: StackedBarConfigInterface<Datum> = this._defaultConfig

  getAccessors = (): NumericAccessor<Datum>[] => (isArray(this.config.y) ? this.config.y : [this.config.y])
  stacked = true
  events = {}
  private _prevNegative: boolean[] | undefined // To help guessing the bar direction when an accessor was set to null or 0
  private _barData: Datum[] = []

  constructor (config?: StackedBarConfigInterface<Datum>) {
    super()
    this.setConfig(config)
  }

  get bleed (): Spacing {
    this._barData = this._getVisibleData()
    if (this._barData.length === 0) return { top: 0, bottom: 0, left: 0, right: 0 }

    // By default, horizontal orientation is "flipped", i.e. the `yDirection` of `XYContainer` is set to `Direction.North`
    const isHorizontalAndFlipped = !this.isVertical() && (this.dataScale.range()[0] > this.dataScale.range()[1])
    const dataDomain = this.dataScale.domain()
    const halfGroupWidth = this._getBarWidth() / 2

    const dataScaleValues = this._barData.map((d, i) => getNumber(d, this.config.x, i))
    const firstDataValue = min(dataScaleValues)
    const lastDataValue = max(dataScaleValues)
    const firstValuePx = this.dataScale(firstDataValue)
    const lastValuePx = this.dataScale(lastDataValue)

    const dataDomainRequiredStart = this.dataScale.invert(firstValuePx + (isHorizontalAndFlipped ? halfGroupWidth : -halfGroupWidth))
    const dataDomainRequiredEnd = this.dataScale.invert(lastValuePx + (isHorizontalAndFlipped ? -halfGroupWidth : halfGroupWidth))
    const bleedPxStart = dataDomainRequiredStart <= dataDomain[0] ? this.dataScale(dataDomain[0]) - this.dataScale(dataDomainRequiredStart) : 0
    const bleedPxEnd = dataDomainRequiredEnd > dataDomain[1] ? this.dataScale(dataDomainRequiredEnd) - this.dataScale(dataDomain[1]) : 0

    return {
      top: this.isVertical() ? 0 : (isHorizontalAndFlipped ? -bleedPxEnd : bleedPxStart),
      bottom: this.isVertical() ? 0 : (isHorizontalAndFlipped ? -bleedPxStart : bleedPxEnd),
      left: this.isVertical() ? bleedPxStart : 0,
      right: this.isVertical() ? bleedPxEnd : 0,
    }
  }

  private get dataScale (): ContinuousScale {
    return this.isVertical() ? this.xScale : this.yScale
  }

  private get valueScale (): ContinuousScale {
    return this.isVertical() ? this.yScale : this.xScale
  }

  private isVertical (): boolean {
    return this.config.orientation === Orientation.Vertical
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const colorOptions = { colorFn: this._colorFunction }

    const yAccessors = this.getAccessors()
    const stacked = getStackedData(this._barData, config.baseline, yAccessors, this._prevNegative)
    this._prevNegative = stacked.map(s => !!s.isMostlyNegative)

    const barGroups = this.g
      .selectAll<SVGGElement, Datum>(`.${s.barGroup}`)
      .data(this._barData, (d, i) => `${getString(d, config.id, i) ?? i}`)

    const getBarGroupsTransform = (d: Datum, i: number): string => {
      const v = this.dataScale(getNumber(d, config.x, i))
      const x = this.isVertical() ? v : 0
      const y = this.isVertical() ? 0 : v
      return `translate(${x},${y})`
    }

    const barGroupsEnter = barGroups.enter().append('g')
      .attr('class', s.barGroup)
      .attr('transform', getBarGroupsTransform)
      .style('opacity', 1)

    const barGroupsMerged = barGroupsEnter.merge(barGroups)
    smartTransition(barGroupsMerged, duration)
      .attr('transform', getBarGroupsTransform)
      .style('opacity', 1)

    const barGroupExit = barGroups.exit()
      .attr('class', s.barGroupExit)

    smartTransition(barGroupExit, duration)
      .style('opacity', 0)
      .remove()
      // `transition.remove()` only fires on `end`; if the transition is interrupted by a re-render,
      // the node would linger in the DOM with opacity < 1 and could be picked up by the next data join.
      .on('interrupt', function () { this.remove() })

    // Animate bars from exiting groups going down
    smartTransition(barGroupExit.selectAll(`.${s.bar}`), duration)
      .attr('transform', this.isVertical()
        ? `translate(0,${this._height / 3})`
        : `translate(${this._width / 6},0)`
      )

    // Render Bars
    const bars = barGroupsMerged
      .selectAll<SVGPathElement, StackedBarDataRecord<Datum>>(`.${s.bar}`)
      .data(
        (d, j) => {
          type StackedBarRenderDatum = {
            datum: Datum;
            index: number;
            stacked: [number, number];
            stackIndex: number;
            isEnding: boolean;
            isStarting: boolean;
          }

          const groupData = stacked
            .map((s, i) => ({
              datum: d,
              index: j,
              stacked: s[j],
              stackIndex: i,
            }))
            // Skip zero-height bars, unless `barMinHeight1Px` asks for them to be drawn as a 1px sliver.
            // The condition mirrors the one in `_getBarPath`, so we don't keep bars it would collapse anyway.
            .filter(d => {
              if (d.stacked[0] !== d.stacked[1]) return true
              if (!config.barMinHeight1Px) return false
              const value = getNumber(d.datum, yAccessors[d.stackIndex], d.index)
              return isFinite(value) && (value !== config.barMinHeightZeroValue)
            }) as StackedBarRenderDatum[]

          // Populate `isEnding`
          // Ending bar if the next stack is not the same as the current one
          groupData.forEach((d, i) => {
            d.isEnding = (i === groupData.length - 1) ||
                ((i <= groupData.length - 1) && groupData[i + 1].stacked[0] !== d.stacked[1])
            // Starting bar if no other segment of the group ends where this one begins, i.e. its
            // lower edge is a free end rather than a seam with the segment beneath it. Positive and
            // negative segments are interleaved by stack index, so we can't rely on array adjacency.
            d.isStarting = !groupData.some(o => o !== d && o.stacked[1] === d.stacked[0])
          })
          return groupData
        },
        d => d.stackIndex // Key function for proper transitions
      )

    const barsEnter = bars.enter().append('path')
      .attr('class', s.bar)
      .attr('d', d => this._getBarPath(d, true))
      .attr(UNOVIS_PATTERN_INDEX_ATTR, d => d.stackIndex)
      .style('fill', d => getColor(d.datum, config.color, d.stackIndex, config.colorKeys?.[d.stackIndex], colorOptions))
      .style('mask', d => getFillPatternValue(getPattern(d.datum, config.pattern, d.stackIndex)))

    const barsMerged = barsEnter.merge(bars)

    barsMerged.style('mask', d => getFillPatternValue(getPattern(d.datum, config.pattern, d.stackIndex)))
    smartTransition(barsMerged, duration)
      .attr('d', d => this._getBarPath(d))
      // A re-entering bar can be mid exit fade; bring it back instead of leaving it semi-transparent
      .style('opacity', 1)
      .style('fill', d => getColor(d.datum, config.color, d.stackIndex, config.colorKeys?.[d.stackIndex], colorOptions))
      .style('cursor', d => getString(d.datum, config.cursor, d.stackIndex))

    // No `interrupt` removal here: an interrupted exit means the next data join has re-adopted the node
    // (it keeps the `bar` class), so it either re-enters the update selection or exits and fades again.
    // Removing it on `interrupt` would delete bars that legitimately re-entered on a rapid re-render.
    smartTransition(bars.exit(), duration)
      .style('opacity', 0)
      .remove()
  }

  _getBarWidth (): number {
    const { config, datamodel: { data } } = this
    if (isEmpty(data)) return 0
    if (config.barWidth) return min([config.barWidth, config.barMaxWidth])

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isOrdinal = this.dataScale.bandwidth
    const domain = (this.dataScale.domain ? this.dataScale.domain() : []) as number[]
    const domainLength = isOrdinal ? domain.length : domain[1] - domain[0]

    // If the dataStep property is provided the amount of data elements is calculates as domainLength / dataStep
    //   otherwise we get the number of data elements within the domain range
    // Or if the scale is ordinal we use data.length
    let dataSize = (1 + domainLength / config.dataStep) ||
        (!isOrdinal && data.filter((d, i) => {
          const value = getNumber(d, config.x, i)
          return (value >= domain[0]) && (value <= domain[1])
        }).length) ||
        data.length

    // We increase the dataSize by 1 to take into account possible additional domain space
    if (!isOrdinal && dataSize >= 2) dataSize += 1

    const c = dataSize < 2 ? 1 : 1 - config.barPadding
    const barWidth = c * (this.isVertical() ? this._width : this._height) / dataSize

    return min([barWidth, config.barMaxWidth])
  }

  _getVisibleData (): Datum[] {
    const { config, datamodel: { data } } = this

    const groupWidth = this._getBarWidth()
    const halfGroupWidthPx = data.length < 2 ? 0 : groupWidth / 2

    const scale = this.dataScale
    const halfGroupWidth = Math.abs((scale.invert(halfGroupWidthPx) as number) - (scale.invert(0) as number))
    const filtered = data?.filter((d, i) => {
      const v = getNumber(d, config.x, i)
      const domain: number[] | Date[] = scale.domain()
      const domainMin = +domain[0]
      const domainMax = +domain[1]
      return (v >= (domainMin - halfGroupWidth)) && (v <= (domainMax + halfGroupWidth))
    })

    return filtered
  }

  _getBarPath (d: StackedBarDataRecord<Datum>, isEntering = false): string {
    const { config } = this
    const yAccessors = this.getAccessors()
    const barWidth = this._getBarWidth()

    // Compare the two stack bounds rather than testing against zero: with a non-zero `baseline`
    // a descending bar can still sit entirely above zero (and an ascending one entirely below it)
    const isNegative = d.stacked[1] < d.stacked[0]
    const isEnding = d.isEnding // The most top bar or, if the value is negative, the most bottom bar
    const value = getNumber(d.datum, yAccessors[d.stackIndex], d.index)
    const height = isEntering ? 0 : Math.abs(this.valueScale(d.stacked[0]) - this.valueScale(d.stacked[1]))
    const h = !isEntering && config.barMinHeight1Px && (height < 1) && isFinite(value) && (value !== config.barMinHeightZeroValue) ? 1 : height
    // Entering bars collapse onto the stack's origin (the baseline, zero by default), so the whole
    // stack grows out of it instead of each segment growing from the start of its own span
    const y = isEntering
      ? this.valueScale(config.baseline ? getNumber(d.datum, config.baseline, d.index) || 0 : 0)
      : this.valueScale(isNegative ? d.stacked[0] : d.stacked[1]) - (height < 1 && config.barMinHeight1Px ? 1 : 0)

    const x = -barWidth / 2
    const width = barWidth

    const cornerRadius = config.roundedCorners
      ? isNumber(config.roundedCorners) ? +config.roundedCorners : width / 2
      : 0
    const cornerRadiusClamped = clamp(cornerRadius, 0, Math.min(height, width) / 2)
    const isNorthDirected = this.yScale.range()[0] > this.yScale.range()[1]

    // Every bar has a "far" end, the one its value grows towards, and a "near" end sitting at the
    // value it starts from. The far end is rounded when the segment tops off its stack (`isEnding`).
    // The near end is only rounded when the segment starts its stack *and* that start isn't the zero
    // line — i.e. the bar floats, as in a waterfall chart. Bars growing out of zero keep a flat edge
    // there, so the default (`baseline` unset) behaviour is unchanged.
    const roundFar = isEnding
    const roundNear = d.isStarting && (d.stacked[0] !== 0)

    // Which side of the rect the far end lands on
    const farIsTop = (!isNegative && isNorthDirected) || (isNegative && !isNorthDirected) // vertical
    const farIsLeft = isNegative // horizontal

    return roundedRectPath({
      x: this.isVertical() ? x : y - h,
      y: this.isVertical() ? y + (isNorthDirected ? 0 : -h) : x,
      w: this.isVertical() ? width : h,
      h: this.isVertical() ? h : width,
      tl: this.isVertical()
        ? (farIsTop ? roundFar : roundNear)
        : (farIsLeft ? roundFar : roundNear),
      tr: this.isVertical()
        ? (farIsTop ? roundFar : roundNear)
        : (farIsLeft ? roundNear : roundFar),
      br: this.isVertical()
        ? (farIsTop ? roundNear : roundFar)
        : (farIsLeft ? roundNear : roundFar),
      bl: this.isVertical()
        ? (farIsTop ? roundNear : roundFar)
        : (farIsLeft ? roundFar : roundNear),
      r: cornerRadiusClamped,
    })
  }

  // After performance optimizations in https://github.com/f5/unovis/pull/708
  // there's a breaking change in the event data structure: the d3 datum bound
  // to each bar is now a `StackedBarDataRecord` wrapper, and the DOM-derived
  // index no longer matches the original row index (zero-height segments are
  // filtered out, and bars from all groups share the same selection).
  // This method maps both back to the pre-#708 contract.
  // Todo: This can be removed in Unovis 2.0, but the migration guide should contain a note about it.
  protected _mapEventDatum (d: StackedBarDataRecord<Datum>): { datum: Datum; index: number } {
    return {
      datum: { ...d, ...d.datum },
      index: d.index,
    }
  }

  getValueScaleExtent (scaleByVisibleData: boolean): number[] {
    const { config, datamodel } = this
    const yAccessors = this.getAccessors()

    const data = scaleByVisibleData ? this._getVisibleData() : datamodel.data
    return getStackedExtentWithBaseline(data, config.baseline, ...yAccessors)
  }

  getDataScaleExtent (): number[] {
    const { config, datamodel } = this
    return getExtent(datamodel.data, config.x)
  }

  getYDataExtent (scaleByVisibleData: boolean): number[] {
    return this.isVertical() ? this.getValueScaleExtent(scaleByVisibleData) : this.getDataScaleExtent()
  }

  getXDataExtent (): number[] {
    return this.isVertical() ? this.getDataScaleExtent() : this.getValueScaleExtent(false)
  }
}
