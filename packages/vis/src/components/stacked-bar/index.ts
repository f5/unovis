// Copyright (c) Volterra, Inc. All rights reserved.
import { min } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, isArray, isEmpty, clamp, getStackedExtent, getString, getNumber, getStackedData, getExtent } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { ContinuousScale } from 'types/scale'
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'
import { Orientation } from 'types/position'

// Local Types
import { StackedBarDataRecord } from './types'

// Config
import { StackedBarConfig, StackedBarConfigInterface } from './config'

// Styles
import * as s from './style'

export class StackedBar<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: StackedBarConfig<Datum> = new StackedBarConfig()
  getAccessors = (): NumericAccessor<Datum>[] => (isArray(this.config.y) ? this.config.y : [this.config.y])
  stacked = true
  private _prevNegative: boolean[] | undefined // To help guessing the bar direction when an accessor was set to null or 0
  events = {}

  constructor (config?: StackedBarConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)
  }

  get bleed (): Spacing {
    const hw = this._getBarWidth() / 2

    return {
      top: this.isVertical() ? 0 : hw,
      bottom: this.isVertical() ? 0 : hw,
      left: this.isVertical() ? hw : 0,
      right: this.isVertical() ? hw : 0,
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
    const visibleData = this._getVisibleData()

    const yAccessors = this.getAccessors()
    const stacked = getStackedData(visibleData, 0, yAccessors, this._prevNegative)
    this._prevNegative = stacked.map(s => !!s.negative)

    const barGroups = this.g
      .selectAll<SVGGElement, Datum>(`.${s.barGroup}`)
      .data(visibleData, (d, i) => `${getString(d, config.id, i) ?? i}`)

    const getBarGroupsTransform = (d: Datum): string => {
      const v = this.dataScale(getNumber(d, config.x))
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

    // Animate bars from exiting groups going down
    smartTransition(barGroupExit.selectAll(`.${s.bar}`), duration)
      .attr('transform', this.isVertical()
        ? `translate(0,${this._height / 3})`
        : `translate(${this._width / 6},0)`
      )

    // Render Bars
    const bars = barGroupsMerged
      .selectAll<SVGPathElement, StackedBarDataRecord<Datum>>(`.${s.bar}`)
      .data((d, i) => stacked.map((s) =>
        ({ ...d, _stacked: s[i], _negative: s.negative, _ending: s.ending }))
      )

    const barsEnter = bars.enter().append('path')
      .attr('class', s.bar)
      .attr('d', (d, i) => this._getBarPath(d, i, true))
      .style('fill', (d, i) => getColor(d, config.color, i))

    const barsMerged = barsEnter.merge(bars)

    smartTransition(barsMerged, duration)
      .attr('d', (d, i) => this._getBarPath(d, i))
      .style('fill', (d, i) => getColor(d, config.color, i))
      .style('cursor', (d, i) => getString(d, config.cursor, i))

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
        (!isOrdinal && data.filter(d => {
          const value = getNumber(d, config.x)
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
    const filtered = data?.filter(d => {
      const v = getNumber(d, config.x)
      const domain: number[] | Date[] = scale.domain()
      const domainMin = +domain[0]
      const domainMax = +domain[1]
      return (v >= (domainMin - halfGroupWidth)) && (v <= (domainMax + halfGroupWidth))
    })

    return filtered
  }

  _getBarPath (d: StackedBarDataRecord<Datum>, i: number, isEntering = false): string {
    const { config } = this
    const yAccessors = this.getAccessors()
    const barWidth = this._getBarWidth()

    const isNegative = d._negative
    const isEnding = d._ending // The most top bar or, if the value is negative, the most bottom bar
    const value = getNumber(d, yAccessors[i])

    const height = isEntering ? 0 : Math.abs(this.valueScale(d._stacked[0]) - this.valueScale(d._stacked[1]))
    const h = !isEntering && config.barMinHeight && (height < 1) && isFinite(value) && (value !== config.barMinHeightZeroValue) ? 1 : height
    const y = isEntering
      ? this.valueScale(0)
      : this.valueScale(isNegative ? d._stacked[0] : d._stacked[1]) - (height < 1 && config.barMinHeight ? 1 : 0)

    const x = -barWidth / 2
    const width = barWidth

    const cornerRadius = config.roundedCorners
      ? isNumber(config.roundedCorners) ? +config.roundedCorners : width / 2
      : 0
    const cornerRadiusClamped = clamp(cornerRadius, 0, Math.min(height, width) / 2)
    const isNorthDirected = this.yScale.range()[0] > this.yScale.range()[1]

    return roundedRectPath({
      x: this.isVertical() ? x : y - h,
      y: this.isVertical() ? y + (isNorthDirected ? 0 : -h) : x,
      w: this.isVertical() ? width : h,
      h: this.isVertical() ? h : width,
      tl: isEnding && (this.isVertical()
        ? (!isNegative && isNorthDirected) || (isNegative && !isNorthDirected)
        : isNegative
      ),
      tr: isEnding && (this.isVertical()
        ? (!isNegative && isNorthDirected) || (isNegative && !isNorthDirected)
        : !isNegative
      ),
      br: isEnding && (this.isVertical()
        ? (isNegative && isNorthDirected) || (!isNegative && !isNorthDirected)
        : !isNegative
      ),
      bl: isEnding && (this.isVertical()
        ? (isNegative && isNorthDirected) || (!isNegative && !isNorthDirected)
        : isNegative
      ),
      r: cornerRadiusClamped,
    })
  }

  getValueScaleExtent (scaleByVisibleData: boolean): number[] {
    const { datamodel } = this
    const yAccessors = this.getAccessors()

    const data = scaleByVisibleData ? this._getVisibleData() : datamodel.data
    return getStackedExtent(data, ...yAccessors)
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
