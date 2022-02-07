// Copyright (c) Volterra, Inc. All rights reserved.
import { scaleBand } from 'd3-scale'
import { min, range } from 'd3-array'
import { select } from 'd3'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { clamp, getMax, getMin, getNumber, getString, isArray, isEmpty, isNumber } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'
import { Direction } from 'types/direction'

// Config
import { GroupedBarConfig, GroupedBarConfigInterface } from './config'

// Styles
import * as s from './style'

export class GroupedBar<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: GroupedBarConfig<Datum> = new GroupedBarConfig()
  getAccessors = (): NumericAccessor<Datum>[] => (isArray(this.config.y) ? this.config.y : [this.config.y])
  events = {
    [GroupedBar.selectors.barGroup]: {
      mouseover: this._raiseSelection,
    },
    [GroupedBar.selectors.bar]: {
      mouseover: this._raiseSelection,
    },
  }

  constructor (config?: GroupedBarConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)
  }

  get bleed (): Spacing {
    const barWidth = this._getGroupWidth()
    return { top: 0, bottom: 0, left: barWidth / 2, right: barWidth / 2 }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const groupWidth = this._getGroupWidth()

    const yAccessors = this.getAccessors()
    const innerBandScaleRange = [-groupWidth / 2, groupWidth / 2] as [number, number]
    const innerBandScale = scaleBand<number>()
      .domain(range(yAccessors.length))
      .range(innerBandScaleRange)
      .paddingInner(config.barPadding)
      .paddingOuter(config.barPadding)

    const visibleData = this._getVisibleData()
    const barGroups = this.g
      .selectAll<SVGGElement, Datum>(`.${s.barGroup}`)
      .data(visibleData, (d, i) => `${getString(d, config.id) ?? i}`)

    const barGroupsEnter = barGroups.enter().append('g')
      .attr('class', s.barGroup)
      .attr('transform', d => `translate(${this.xScale(getNumber(d, config.x))}, 0)`)
      .style('opacity', 1)

    const barGroupsMerged = barGroupsEnter.merge(barGroups)
    smartTransition(barGroupsMerged, duration)
      .attr('transform', d => `translate(${this.xScale(getNumber(d, config.x))}, 0)`)
      .style('opacity', 1)

    const barGroupExit = barGroups.exit()
      .attr('class', s.barGroupExit)
    smartTransition(barGroupExit, duration)
      .style('opacity', 0)
      .remove()

    // Animate exiting bars going down
    smartTransition(barGroupExit.selectAll(`.${s.bar}`), duration)
      .attr('transform', `translate(0,${this._height / 3})`)

    const barWidth = innerBandScale.bandwidth()
    const bars = barGroupsMerged
      .selectAll<SVGPathElement, Datum>(`.${s.bar}`)
      .data(d => yAccessors.map(() => d))

    const yDirection = this.yScale.range()[0] > this.yScale.range()[1] ? Direction.North : Direction.South
    const barsEnter = bars.enter().append('path')
      .attr('class', s.bar)
      .attr('d', (d, i) => {
        const x = innerBandScale(i)
        const y = this.yScale(0)
        const width = barWidth
        const height = 0
        return this._getBarPath(x, y, width, height, false, yDirection)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))

    const barsMerged = barsEnter.merge(bars)

    smartTransition(barsMerged, duration)
      .attr('d', (d, i) => {
        const x = innerBandScale(i)
        const width = barWidth

        const value = getNumber(d, yAccessors[i])
        const isNegative = value < 0
        let y = isNegative ? this.yScale(0) : this.yScale(value || 0)
        let height = Math.abs(this.yScale(0) - this.yScale(value)) || 0

        // Optionally set minimum bar height
        if (height < config.barMinHeight) {
          y = this.yScale(0) - config.barMinHeight
          height = config.barMinHeight
        }

        return this._getBarPath(x, y, width, height, isNegative, yDirection)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))
      .style('cursor', (d, i) => getString(d, config.cursor, i))

    smartTransition(bars.exit(), duration)
      .remove()
  }

  _getVisibleData (): Datum[] {
    const { config, datamodel: { data } } = this

    const groupWidth = this._getGroupWidth()
    const halfGroupWidth = data.length < 2 ? 0 : groupWidth / 2

    const xScale = this.xScale
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

  _getBarPath (x: number, y: number, width: number, height: number, isNegative: boolean, direction: Direction.North | Direction.South): string {
    const { config } = this

    const cornerRadius = config.roundedCorners
      ? isNumber(config.roundedCorners) ? +config.roundedCorners : width / 2
      : 0
    const cornerRadiusClamped = clamp(cornerRadius, 0, Math.min(height, width) / 2)

    const isNorthDirected = direction === Direction.North
    return roundedRectPath({
      x,
      y: y + (isNorthDirected ? 0 : -height),
      w: width,
      h: height,
      tl: (!isNegative && isNorthDirected) || (isNegative && !isNorthDirected),
      tr: (!isNegative && isNorthDirected) || (isNegative && !isNorthDirected),
      bl: (isNegative && isNorthDirected) || (!isNorthDirected && !isNegative),
      br: (isNegative && isNorthDirected) || (!isNorthDirected && !isNegative),
      r: cornerRadiusClamped,
    })
  }

  _getGroupWidth (): number {
    const { config, datamodel: { data } } = this
    if (isEmpty(data)) return 0
    if (config.groupWidth) return min([config.groupWidth, config.groupMaxWidth])

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isOrdinal = this.xScale.bandwidth
    const xDomain = (this.xScale.domain ? this.xScale.domain() : []) as number[]
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

    const c = dataSize < 2 ? 1 : 1 - config.groupPadding
    const groupWidth = c * this._width / (dataSize)

    return min([groupWidth, config.groupMaxWidth])
  }

  getYDataExtent (scaleByVisibleData: boolean): number[] {
    const { datamodel } = this
    const yAccessors = this.getAccessors()

    const data = scaleByVisibleData ? this._getVisibleData() : datamodel.data
    const min = getMin(data, ...yAccessors)
    const max = getMax(data, ...yAccessors)
    return [min > 0 ? 0 : min, max < 0 ? 0 : max]
  }

  _raiseSelection (d, i, els): void {
    select(els[i]).raise()
  }
}
