import { scaleBand } from 'd3-scale'
import { min, max, range } from 'd3-array'
import { select } from 'd3'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { clamp, getExtent, getMax, getMin, getNumber, getString, isArray, isEmpty, isNumber } from 'utils/data'
import { roundedRectPath } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'
import { Direction } from 'types/direction'
import { Orientation } from 'types/position'
import { ContinuousScale } from 'types/scale'

// Config
import { GroupedBarDefaultConfig, GroupedBarConfigInterface } from './config'

// Styles
import * as s from './style'

export class GroupedBar<Datum> extends XYComponentCore<Datum, GroupedBarConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = GroupedBarDefaultConfig as GroupedBarConfigInterface<Datum>
  public config: GroupedBarConfigInterface<Datum> = this._defaultConfig

  getAccessors = (): NumericAccessor<Datum>[] =>
    isArray(this.config.y) ? this.config.y : [this.config.y]

  events = {
    [GroupedBar.selectors.barGroup]: {
      mouseover: this._raiseSelection,
    },
    [GroupedBar.selectors.bar]: {
      mouseover: this._raiseSelection,
    },
  }

  private _barData: Datum[] = []

  constructor (config?: GroupedBarConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
  }

  get bleed (): Spacing {
    this._barData = this._getVisibleData()
    if (this._barData.length === 0) return { top: 0, bottom: 0, left: 0, right: 0 }

    // By default, horizontal orientation is "flipped", i.e. the `yDirection` of `XYContainer` is set to `Direction.North`
    const isHorizontalAndFlipped = !this.isVertical() && (this.dataScale.range()[0] > this.dataScale.range()[1])
    const dataDomain = this.dataScale.domain()
    const halfGroupWidth = this._getGroupWidth() / 2

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
    const duration = isNumber(customDuration)
      ? customDuration
      : config.duration
    const groupWidth = this._getGroupWidth()

    const yAccessors = this.getAccessors()
    const innerBandScaleRange = [-groupWidth / 2, groupWidth / 2] as [
      number,
      number,
    ]
    const innerBandScale = scaleBand<number>()
      .domain(range(yAccessors.length))
      .range(innerBandScaleRange)
      .paddingInner(config.barPadding)
      .paddingOuter(config.barPadding)

    const barGroups = this.g
      .selectAll<SVGGElement, Datum>(`.${s.barGroup}`)
      .data(this._barData, (d, i) => `${getString(d, config.id, i) ?? i}`)

    const getBarGroupsTransform = (d: Datum, i: number): string => {
      const v = this.dataScale(getNumber(d, config.x, i))
      const x = this.isVertical() ? v : 0
      const y = this.isVertical() ? 0 : v
      return `translate(${x},${y})`
    }

    const barGroupsEnter = barGroups
      .enter()
      .append('g')
      .attr('class', s.barGroup)
      .attr('transform', getBarGroupsTransform)
      .style('opacity', 1)

    const barGroupsMerged = barGroupsEnter.merge(barGroups)
    smartTransition(barGroupsMerged, duration)
      .attr('transform', getBarGroupsTransform)
      .style('opacity', 1)

    const barGroupExit = barGroups.exit().attr('class', s.barGroupExit)
    smartTransition(barGroupExit, duration).style('opacity', 0).remove()

    // Animate exiting bars going down
    smartTransition(barGroupExit.selectAll<SVGPathElement, Datum>(`.${s.bar}`), duration)
      .attr('transform', (d, i, e) => {
        return this.isVertical()
          ? `translate(0,${this.yScale(0)}) scale(1,0)`
          : `translate(${this.xScale(0)},0) scale(0,1)`
      })

    const barWidth = innerBandScale.bandwidth()
    const bars = barGroupsMerged
      .selectAll<SVGPathElement, Datum>(`.${s.bar}`)
      .data((d) => yAccessors.map(() => d))

    const valueAxisDirection = this._getValueAxisDirection()
    const barsEnter = bars
      .enter()
      .append('path')
      .attr('class', s.bar)
      .attr('d', (d, i) => {
        const x = innerBandScale(i)
        const y = this.valueScale(0)
        const width = barWidth
        const height = 0
        return this._getBarPath(x, y, width, height, false, valueAxisDirection)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))

    const barsMerged = barsEnter.merge(bars)
    smartTransition(barsMerged, duration)
      .attr('d', (d, j) => {
        const x = innerBandScale(j)
        const width = barWidth

        // Todo: Find a way to pass the datum index to `getNumber` below
        const value = getNumber(d, yAccessors[j])
        const isNegative = value < 0
        let y = isNegative ? this.valueScale(0) : this.valueScale(value || 0)
        let height = Math.abs(this.valueScale(0) - this.valueScale(value)) || 0

        // Optionally set minimum bar height
        if (height < config.barMinHeight) {
          const dir = valueAxisDirection === Direction.North ? -1 : 1
          y = this.valueScale(0) + dir * config.barMinHeight
          height = config.barMinHeight
        }
        return this._getBarPath(x, y, width, height, isNegative, valueAxisDirection)
      })
      .style('fill', (d, i) => getColor(d, config.color, i))
      .style('cursor', (d, i) => getString(d, config.cursor, i))

    smartTransition(bars.exit(), duration).remove()
  }

  _getValueAxisDirection (): Direction.North | Direction.South {
    return this.valueScale.range()[0] > this.valueScale.range()[1]
      ? Direction.North
      : Direction.South
  }

  _getVisibleData (): Datum[] {
    const {
      config,
      datamodel: { data },
    } = this
    const groupWidth = this._getGroupWidth()
    const halfGroupWidth = data.length < 2 ? 0 : groupWidth / 2

    const dataScale = this.dataScale
    const xHalfGroupWidth = Math.abs(
      (dataScale.invert(halfGroupWidth) as number) -
        (dataScale.invert(0) as number)
    )
    const filtered = data?.filter((d, i) => {
      const v = getNumber(d, config.x, i)
      const domain: number[] | Date[] = dataScale.domain()
      const domainMin = +domain[0]
      const domainMax = +domain[1]
      return (
        v >= domainMin - xHalfGroupWidth && v <= domainMax + xHalfGroupWidth
      )
    })

    return filtered
  }

  _getBarPath (
    x: number,
    y: number,
    width: number,
    height: number,
    isNegative: boolean,
    direction: Direction.North | Direction.South
  ): string {
    const { config } = this

    const cornerRadius = config.roundedCorners
      ? isNumber(config.roundedCorners)
        ? +config.roundedCorners
        : width / 2
      : 0
    const cornerRadiusClamped = clamp(
      cornerRadius,
      0,
      Math.min(height, width) / 2
    )

    const isNorthDirected = direction === Direction.North
    const roundedTop = this.isVertical() && isNegative !== isNorthDirected
    const roundedBottom = this.isVertical() && isNegative === isNorthDirected
    const roundedLeft = !this.isVertical() && isNegative
    const roundedRight = !this.isVertical() && !isNegative

    return roundedRectPath({
      x: this.isVertical() ? x : y + (isNorthDirected ? 0 : -height),
      y: this.isVertical() ? y + (isNorthDirected ? 0 : -height) : x,
      w: this.isVertical() ? width : height,
      h: this.isVertical() ? height : width,
      tl: roundedTop || roundedLeft,
      tr: roundedTop || roundedRight,
      bl: roundedBottom || roundedLeft,
      br: roundedBottom || roundedRight,
      r: cornerRadiusClamped,
    })
  }

  _getGroupWidth (): number {
    const {
      config,
      datamodel: { data },
    } = this
    if (isEmpty(data)) return 0
    if (config.groupWidth) { return min([config.groupWidth, config.groupMaxWidth]) }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isOrdinal = this.dataScale.bandwidth
    const domain = (
      this.dataScale.domain ? this.dataScale.domain() : []
    ) as number[]
    const domainLength = isOrdinal ? domain.length : domain[1] - domain[0]

    // If the dataStep property is provided the amount of data elements is calculates as domainLength / dataStep
    //   otherwise we get the number of data elements within the domain range
    // Or if the scale is ordinal we use data.length
    let dataSize =
      1 + domainLength / config.dataStep ||
      (!isOrdinal &&
        data.filter((d, i) => {
          const value = getNumber(d, config.x, i)
          return value >= domain[0] && value <= domain[1]
        }).length) ||
      data.length

    // We increase the dataSize by 1 to take into account possible additional domain space
    if (!isOrdinal && dataSize >= 2) dataSize += 1

    const c = dataSize < 2 ? 1 : 1 - config.groupPadding
    const groupWidth =
      (c * (this.isVertical() ? this._width : this._height)) / dataSize
    return min([groupWidth, config.groupMaxWidth])
  }

  getValueScaleExtent (scaleByVisibleData: boolean): number[] {
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

  getDataScaleExtent (): number[] {
    const { config, datamodel } = this
    return getExtent(datamodel.data, config.x)
  }

  getYDataExtent (scaleByVisibleData: boolean): number[] {
    return this.isVertical()
      ? this.getValueScaleExtent(scaleByVisibleData)
      : this.getDataScaleExtent()
  }

  getXDataExtent (): number[] {
    return this.isVertical()
      ? this.getDataScaleExtent()
      : this.getValueScaleExtent(false)
  }
}
