// Copyright (c) Volterra, Inc. All rights reserved.
import { min } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isArray, isEmpty, clamp } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor, Spacing } from 'types/misc'

// Config
import { StackedBarConfig, StackedBarConfigInterface } from './config'

// Styles
import * as s from './style'

export class StackedBar<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: StackedBarConfig<Datum> = new StackedBarConfig()
  stacked = true
  // linePath: Selection<SVGGElement, object[], SVGGElement, object[]>
  events = {
    [StackedBar.selectors.bar]: {
      mousemove: this._onEvent,
      mouseover: this._onEvent,
      mouseleave: this._onEvent,
    },
  }

  constructor (config?: StackedBarConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)
  }

  // setData (data): void {
  //   super.setData(data)
  // }

  get bleed (): Spacing {
    const barWidth = this._getBarWidth()
    return { top: 0, bottom: 0, left: barWidth / 2, right: barWidth / 2 }
  }

  _render (customDuration?: number): void {
    const { config, datamodel } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const barWidth = this._getBarWidth()
    const visibleData = this._getVisibleData()

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const stackedValues = visibleData.map(d => datamodel.getStackedValues(d, ...yAccessors))

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

    smartTransition(barGroups.exit(), duration)
      .style('opacity', 0)
      .remove()
    // Animate exiting bars going down
    smartTransition(barGroups.exit().selectAll(`.${s.bar}`), duration)
      .attr('transform', `translate(0,${config.height / 3})`)

    const bars = barGroupsMerged.selectAll(`.${s.bar}`)
      .data((d, i) => yAccessors.map(() => ({ ...d, _stacked: stackedValues[i] })))

    const barsEnter = bars.enter().append('path')
      .attr('class', s.bar)
      .attr('d', (d, i) => {
        const x = -barWidth / 2
        const y = config.scales.y(0)
        const width = barWidth
        const height = 0
        const rounded = i === d._stacked.length - 1
        return this._getBarPath(x, y, width, height, rounded)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))

    const barsMerged = barsEnter.merge(bars)

    smartTransition(barsMerged, duration)
      .attr('d', (d, i) => {
        const x = -barWidth / 2
        const y = config.scales.y(d._stacked[i])
        const width = barWidth
        const height = config.scales.y(d._stacked[i - 1] ?? 0) - config.scales.y(d._stacked[i])
        const rounded = i === d._stacked.length - 1
        return this._getBarPath(x, y, width, height, rounded)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))

    smartTransition(bars.exit(), duration)
      .remove()
  }

  _getBarWidth (): number {
    const { config, datamodel: { data } } = this
    if (isEmpty(data)) return 0
    if (config.barWidth) return min([config.barWidth, config.barMaxWidth])

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const isOrdinal = config.scales.x.bandwidth
    const xDomain = (config.scales.x.domain ? config.scales.x.domain() : []) as number[]
    const xDomainLength = isOrdinal ? xDomain.length : xDomain[1] - xDomain[0]

    // If the dataStep property is provided the amount of data elements is calculates as domainLength / dataStep
    //   othwerise we get the number of data elements within the domain range
    // Or if the scale is ordinal we use data.length
    let dataSize = (1 + xDomainLength / config.dataStep) ||
        (!isOrdinal && data.filter(d => {
          const value = getValue(d, config.x)
          return (value >= xDomain[0]) && (value <= xDomain[1])
        }).length) ||
        data.length

    // We increase the dataSize by 1 to take into account possible additional domain space
    if (!isOrdinal && dataSize >= 2) dataSize += 1

    const c = dataSize < 2 ? 1 : 1 - config.barPadding
    const barWidth = c * (config.isVertical ? config.width : config.height) / dataSize

    return min([barWidth, config.barMaxWidth])
  }

  _getVisibleData (): Datum[] {
    const { config, datamodel: { data } } = this

    const groupWidth = this._getBarWidth()
    const halfGroupWidth = data.length < 2 ? 0 : groupWidth / 2

    const xScale = config.scales.x
    const xHalfGroupWidth = Math.abs((xScale.invert(halfGroupWidth) as number) - (xScale.invert(0) as number))
    const filtered = data?.filter(d => {
      const v = getValue(d, config.x)
      const xDomain = xScale.domain() as number[]
      return (v >= (xDomain[0] - xHalfGroupWidth)) && (v <= (xDomain[1] + xHalfGroupWidth))
    })

    return filtered
  }

  _getBarPath (x, y, width, height, rounded): string {
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
      tl: rounded,
      tr: rounded,
      r: cornerRadiusClamped,
    })
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    return datamodel.getStackedExtent(...yAccessors)
  }
}
