// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { min } from 'd3-array'
import { interpolatePath } from 'd3-interpolate-path'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isArray, isEmpty } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'

// Types
import { NumericAccessor } from 'types/misc'

// Config
import { StackedBarConfig, StackedBarConfigInterface } from './config'

// Styles
import * as s from './style'

export class StackedBar<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: StackedBarConfig<Datum> = new StackedBarConfig()
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

  // setData (data: any): void {
  //   super.setData(data)
  // }

  get bleed (): { top: number; bottom: number; left: number; right: number } {
    const barWidth = this._getBarWidth()
    return { top: 0, bottom: 0, left: barWidth / 2, right: barWidth / 2 }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const start = config.scales.y.range()[0]

    const barGroups = this.g
      .selectAll(`.${s.bar}`)
      .data(this._prepareData(), d => d.id)

    const barGroupsEnter = barGroups.enter().append('path')
      .attr('class', s.bar)
      .attr('d', d => roundedRectPath(
        config.isVertical ? { ...d, y: start, h: 0 } : { ...d, x: start, w: 0 }
      ))

    let barGroupsMerged = barGroupsEnter.merge(barGroups)
      .style('fill', d => d.color)
    if (duration) {
      barGroupsMerged = barGroupsMerged
        .transition()
        .duration(duration)
        .attrTween('d', (d, i, el) => {
          const previous = select(el[i]).attr('d')
          const next = roundedRectPath(d)
          return interpolatePath(previous, next)
        })
    } else {
      barGroupsMerged = barGroupsMerged.attr('d', roundedRectPath)
    }

    smartTransition(barGroups.exit().style('opacity', 1), duration)
      .style('opacity', 0)
      .remove()
  }

  _prepareData (): any[] {
    const { config, datamodel: { data } } = this
    const isVertical = config.isVertical

    const start = 0
    const flatData = []
    const barWidth = this._getBarWidth()
    const halfBarWidth = data.length < 2 ? 0 : barWidth / 2

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const xScale = config.scales.x
    const xHalfBarWidth = Math.abs((xScale.invert(halfBarWidth) as number) - (xScale.invert(0) as number))
    const filtered = data?.filter(d => {
      const v = getValue(d, config.x)
      const xDomain = xScale.domain() as number[]
      return (v >= (xDomain[0] - xHalfBarWidth)) && (v <= (xDomain[1] + xHalfBarWidth))
    })

    filtered?.forEach((d, index) => {
      const x = getValue(d, config.x)
      let stackedValue = start

      // Y coordinate to stack next bar to
      yAccessors?.forEach((accessor, i) => {
        const y = getValue(d, accessor) || 0
        const isLastValue = i === yAccessors.length - 1
        const lastBars = yAccessors.slice(i + 1, yAccessors.length)
        const lastBarsValue = lastBars
          .map(a => getValue(d, a) ?? 0)
          .reduce((sum, value) => sum + value, 0)

        let size
        if (isVertical) {
          const h = config.scales.y(start) - config.scales.y(y + (stackedValue === start ? 0 : start))
          let deltaY = 0
          if (h === 0) deltaY = lastBarsValue === 0 && i !== 0 ? 0 : 1
          size = {
            x: config.scales.x(x) - halfBarWidth,
            y: config.scales.y(y - start + stackedValue) - deltaY,
            w: barWidth,
            h: h + deltaY,
          }
        } else {
          const w = config.scales.y(start) + config.scales.y(y + (stackedValue === start ? 0 : start))
          let deltaX = 0
          if (w === 0) deltaX = lastBarsValue === 0 && i !== 0 ? 0 : 1
          size = {
            x: config.scales.y(stackedValue - (stackedValue === start ? 0 : start)),
            y: config.scales.x(x) - halfBarWidth,
            w: w + deltaX,
            h: barWidth,
          }
        }

        const obj = {
          id: `${accessor?.toString()} ${index}`,
          ...size,
          ...{
            color: this.getColor(d, config.color, i),
            data: d,
          },
        }

        const roundedCorners = config.roundedCorners
        if (roundedCorners && (isLastValue || lastBarsValue === 0)) {
          const r = isNumber(roundedCorners) ? roundedCorners : halfBarWidth
          const minRectDimHalf = Math.min(obj.h, obj.w) / 2
          if (this.config.isVertical) {
            obj.tl = true
            obj.tr = true
          } else {
            obj.br = true
            obj.tr = true
          }
          obj.r = r > minRectDimHalf ? minRectDimHalf : r
        }

        stackedValue += y
        flatData.push(obj)
      })
    })

    return flatData
  }

  _getBarWidth (): number {
    const { config: { scales, barWidth, barMaxWidth, expectedDataStep, isVertical, barPadding, x, width, height }, datamodel: { data } } = this
    if (isEmpty(data)) return 0
    if (barWidth) return min([barWidth, barMaxWidth])

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const isOrdinal = scales.x.bandwidth
    const xDomain = (scales.x.domain ? scales.x.domain() : []) as number[]
    const xDomainLength = isOrdinal ? xDomain.length : xDomain[1] - xDomain[0]

    const dataSize = xDomainLength / expectedDataStep ||
        (!isOrdinal && data.filter(d => {
          const value = getValue(d, x)
          return (value >= xDomain[0]) && (value <= xDomain[1])
        }).length) ||
        data.length
    const dimension = isVertical ? width : height
    const c = dataSize < 2 ? 1 : 1 - barPadding

    return min([c * dimension / dataSize, barMaxWidth])
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this
    return datamodel.getStackedExtent(config.y)
  }
}
