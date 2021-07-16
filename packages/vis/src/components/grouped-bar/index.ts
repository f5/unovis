// Copyright (c) Volterra, Inc. All rights reserved.
import { scaleBand } from 'd3-scale'
import { min, range } from 'd3-array'
import { select } from 'd3'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isArray, isEmpty, clamp, getMin, getMax } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'

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
      .selectAll(`.${s.barGroup}`)
      .data(visibleData, (d, i) => `${getValue(d, config.id) ?? i}`)

    const barGroupsEnter = barGroups.enter().append('g')
      .attr('class', s.barGroup)
      .attr('transform', d => `translate(${config.scales.x(getValue(d, config.x))}, 0)`)
      .style('opacity', 1)

    const barGroupsMerged = barGroupsEnter.merge(barGroups)
    smartTransition(barGroupsMerged, duration)
      .attr('transform', d => `translate(${config.scales.x(getValue(d, config.x))}, 0)`)
      .style('opacity', 1)

    const barGroupExit = barGroups.exit()
      .attr('class', s.barGroupExit)
    smartTransition(barGroupExit, duration)
      .style('opacity', 0)
      .remove()

    // Animate exiting bars going down
    smartTransition(barGroupExit.selectAll(`.${s.bar}`), duration)
      .attr('transform', `translate(0,${config.height / 3})`)

    const barWidth = innerBandScale.bandwidth()
    const bars = barGroupsMerged.selectAll(`.${s.bar}`)
      .data(d => yAccessors.map(() => d))

    const barsEnter = bars.enter().append('path')
      .attr('class', s.bar)
      .attr('d', (d, i) => {
        const x = innerBandScale(i)
        const y = config.scales.y(0)
        const width = barWidth
        const height = 0
        return this._getBarPath(x, y, width, height)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))

    const barsMerged = barsEnter.merge(bars)

    smartTransition(barsMerged, duration)
      .attr('d', (d, i) => {
        const x = innerBandScale(i)
        const width = barWidth

        let y = config.scales.y(getValue(d, yAccessors[i]))
        let height = config.scales.y(0) - config.scales.y(getValue(d, yAccessors[i]))

        // Optionally set minumum bar height
        if (height < config.barMinHeight) {
          y = config.scales.y(0) - config.barMinHeight
          height = config.barMinHeight
        }

        return this._getBarPath(x, y, width, height)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))
      .style('cursor', (d, i) => getValue(d, config.cursor, i))

    smartTransition(bars.exit(), duration)
      .remove()
  }

  _getVisibleData (): Datum[] {
    const { config, datamodel: { data } } = this

    const groupWidth = this._getGroupWidth()
    const halfGroupWidth = data.length < 2 ? 0 : groupWidth / 2

    const xScale = config.scales.x
    const xHalfGroupWidth = Math.abs((xScale.invert(halfGroupWidth) as number) - (xScale.invert(0) as number))
    const filtered = data?.filter(d => {
      const v = getValue(d, config.x)
      const xDomain: number[] | Date[] = xScale.domain()
      const xDomainMin = +xDomain[0]
      const xDomainMax = +xDomain[1]
      return (v >= (xDomainMin - xHalfGroupWidth)) && (v <= (xDomainMax + xHalfGroupWidth))
    })

    return filtered
  }

  _getBarPath (x, y, width, height): string {
    const { config } = this

    const cornerRadius = config.roundedCorners
      ? isNumber(config.roundedCorners) ? +config.roundedCorners : width / 2
      : 0
    const cornerRadiusClamped = clamp(cornerRadius, 0, Math.min(height, width) / 2)

    return roundedRectPath({
      x,
      y,
      w: width,
      h: height,
      tl: true,
      tr: true,
      r: cornerRadiusClamped,
    })
  }

  _getGroupWidth (): number {
    const { config, datamodel: { data } } = this
    if (isEmpty(data)) return 0
    if (config.groupWidth) return min([config.groupWidth, config.groupMaxWidth])

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isOrdinal = config.scales.x.bandwidth
    const xDomain = (config.scales.x.domain ? config.scales.x.domain() : []) as number[]
    const xDomainLength = isOrdinal ? xDomain.length : xDomain[1] - xDomain[0]

    // If the dataStep property is provided the amount of data elements is calculates as domainLength / dataStep
    //   otherwise we get the number of data elements within the domain range
    // Or if the scale is ordinal we use data.length
    let dataSize = (1 + xDomainLength / config.dataStep) ||
        (!isOrdinal && data.filter(d => {
          const value = getValue(d, config.x)
          return (value >= xDomain[0]) && (value <= xDomain[1])
        }).length) ||
        data.length

    // We increase the dataSize by 1 to take into account possible additional domain space
    if (!isOrdinal && dataSize >= 2) dataSize += 1

    const c = dataSize < 2 ? 1 : 1 - config.groupPadding
    const groupWidth = c * (config.isVertical ? config.width : config.height) / (dataSize)

    return min([groupWidth, config.groupMaxWidth])
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this
    const yAccessors = this.getAccessors()

    const data = config.adaptiveYScale ? this._getVisibleData() : datamodel.data
    const min = getMin(data, ...yAccessors)
    const max = getMax(data, ...yAccessors)
    return [min > 0 ? 0 : min, max < 0 ? 0 : max]
  }

  _raiseSelection (d, i, els): void {
    select(els[i]).raise()
  }
}
