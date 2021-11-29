// Copyright (c) Volterra, Inc. All rights reserved.
import { min } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, isArray, isEmpty, clamp, getStackedExtent, getString, getNumber, getStackedData } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'

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
    const barWidth = this._getBarWidth()
    return { top: 0, bottom: 0, left: barWidth / 2, right: barWidth / 2 }
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
      .data(visibleData, (d, i) => `${getString(d, config.id) ?? i}`)

    const barGroupsEnter = barGroups.enter().append('g')
      .attr('class', s.barGroup)
      .attr('transform', d => `translate(${config.xScale(getNumber(d, config.x))}, 0)`)
      .style('opacity', 1)

    const barGroupsMerged = barGroupsEnter.merge(barGroups)
    smartTransition(barGroupsMerged, duration)
      .attr('transform', d => `translate(${config.xScale(getNumber(d, config.x))}, 0)`)
      .style('opacity', 1)

    const barGroupExit = barGroups.exit()
      .attr('class', s.barGroupExit)

    smartTransition(barGroupExit, duration)
      .style('opacity', 0)
      .remove()

    // Animate bars from exiting groups going down
    smartTransition(barGroupExit.selectAll(`.${s.bar}`), duration)
      .attr('transform', `translate(0,${this._height / 3})`)

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
    const isOrdinal = config.xScale.bandwidth
    const xDomain = (config.xScale.domain ? config.xScale.domain() : []) as number[]
    const xDomainLength = isOrdinal ? xDomain.length : xDomain[1] - xDomain[0]

    // If the dataStep property is provided the amount of data elements is calculates as domainLength / dataStep
    //   otherwise we get the number of data elements within the domain range
    // Or if the scale is ordinal we use data.length
    let dataSize = (1 + xDomainLength / config.dataStep) ||
        (!isOrdinal && data.filter(d => {
          const value = getNumber(d, config.x)
          return (value >= xDomain[0]) && (value <= xDomain[1])
        }).length) ||
        data.length

    // We increase the dataSize by 1 to take into account possible additional domain space
    if (!isOrdinal && dataSize >= 2) dataSize += 1

    const c = dataSize < 2 ? 1 : 1 - config.barPadding
    const barWidth = c * this._width / dataSize

    return min([barWidth, config.barMaxWidth])
  }

  _getVisibleData (): Datum[] {
    const { config, datamodel: { data } } = this

    const groupWidth = this._getBarWidth()
    const halfGroupWidth = data.length < 2 ? 0 : groupWidth / 2

    const xScale = config.xScale
    const xHalfGroupWidth = Math.abs((xScale.invert(halfGroupWidth) as number) - (xScale.invert(0) as number))
    const filtered = data?.filter(d => {
      const v = getNumber(d, config.x)
      const xDomain: number[] | Date[] = xScale.domain()
      const xDomainMin = +xDomain[0]
      const xDomainMax = +xDomain[1]
      return (v >= (xDomainMin - xHalfGroupWidth)) && (v <= (xDomainMax + xHalfGroupWidth))
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

    const height = isEntering ? 0 : Math.abs(config.yScale(d._stacked[0]) - config.yScale(d._stacked[1]))
    const h = !isEntering && config.barMinHeight && (height < 1) && isFinite(value) && (value !== config.barMinHeightZeroValue) ? 1 : height
    const y = isEntering ? config.yScale(0) : config.yScale(isNegative ? d._stacked[0] : d._stacked[1]) - (height < 1 && config.barMinHeight ? 1 : 0)

    const x = -barWidth / 2
    const width = barWidth

    const cornerRadius = config.roundedCorners
      ? isNumber(config.roundedCorners) ? +config.roundedCorners : width / 2
      : 0
    const cornerRadiusClamped = clamp(cornerRadius, 0, Math.min(height, width) / 2)

    return roundedRectPath({
      x,
      y,
      w: width,
      h,
      br: isNegative && isEnding,
      bl: isNegative && isEnding,
      tl: !isNegative && isEnding,
      tr: !isNegative && isEnding,
      r: cornerRadiusClamped,
    })
  }

  getYDataExtent (): number[] {
    const { datamodel, config } = this
    const yAccessors = this.getAccessors()

    const data = config.scaleByDomain ? this._getVisibleData() : datamodel.data
    return getStackedExtent(data, ...yAccessors)
  }
}
