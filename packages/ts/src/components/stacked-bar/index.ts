import { min, max } from 'd3-array'

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
  private _prevNegative: boolean[] | undefined
  private _barData: Datum[] = []

  constructor (config?: StackedBarConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
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

    const yAccessors = this.getAccessors()
    const stacked = getStackedData(this._barData, 0, yAccessors, this._prevNegative)
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

    // Animate bars from exiting groups going down
    smartTransition(barGroupExit.selectAll(`.${s.bar}`), duration)
      .attr('transform', this.isVertical()
        ? `translate(0,${this._height / 3})`
        : `translate(${this._width / 6},0)`
      )

    // Render Bars
    const stackExtents = this._barData.map((_, j) => {
      const values = stacked.map(s => s[j]) // Get all [y0, y1] pairs for stack j
      const positiveY1 = values.filter(v => v[1] >= v[0]).map(v => v[1])
      const negativeY1 = values.filter(v => v[1] < v[0]).map(v => v[1])
      return {
        maxPositive: positiveY1.length ? max(positiveY1) : undefined,
        minNegative: negativeY1.length ? min(negativeY1) : undefined,
      }
    })

    const bars = barGroupsMerged
      .selectAll<SVGPathElement, StackedBarDataRecord<Datum>>(`.${s.bar}`)
      .data((d, j) => {
        const { maxPositive, minNegative } = stackExtents[j]
        return stacked.map((s) => {
          const y0 = s[j][0]
          const y1 = s[j][1]
          const isSegmentPositive = y1 >= y0

          // A bar is "ending" if it's the outermost in its respective direction (positive or negative)
          const isEnding = isSegmentPositive
            ? y1 === maxPositive
            : y1 === minNegative

          return {
            ...d,
            _index: j,
            _stacked: s[j],
            _ending: isEnding,
          }
        })
      })

    const barsEnter = bars.enter().append('path')
      .attr('class', s.bar)
      .attr('d', (d, j) => this._getBarPath(d, j, true))
      .style('fill', (d, j) => getColor(d, config.color, j))

    const barsMerged = barsEnter.merge(bars)

    smartTransition(barsMerged, duration)
      .attr('d', (d, j) => this._getBarPath(d, j))
      .style('fill', (d, j) => getColor(d, config.color, j))
      .style('cursor', (d, j) => getString(d, config.cursor, j))

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

  _getBarPath (d: StackedBarDataRecord<Datum>, accessorIndex: number, isEntering = false): string {
    const { config } = this
    const yAccessors = this.getAccessors()
    const barWidth = this._getBarWidth()

    const isNegative = d._stacked[1] < 0
    const isEnding = d._ending // The most top bar or, if the value is negative, the most bottom bar
    const value = getNumber(d, yAccessors[accessorIndex], d._index)
    const height = isEntering ? 0 : Math.abs(this.valueScale(d._stacked[0]) - this.valueScale(d._stacked[1]))
    const h = !isEntering && config.barMinHeight1Px && (height < 1) && isFinite(value) && (value !== config.barMinHeightZeroValue) ? 1 : height
    const y = isEntering
      ? this.valueScale(0)
      : this.valueScale(isNegative ? d._stacked[0] : d._stacked[1]) - (height < 1 && config.barMinHeight1Px ? 1 : 0)

    const x = -barWidth / 2
    const width = barWidth

    // --- Spacing between stacked items ---
    const stackSpacing = config.stackSpacing || 0
    let hWithSpacing = h
    let yWithSpacing = y
    // For negative bars, shift y position by stackSpacing so the base remains at the correct value
    if (!isEntering && stackSpacing > 0) {
      hWithSpacing = h - stackSpacing
      if (hWithSpacing <= 0 && isFinite(value) && (value !== config.barMinHeightZeroValue)) {
        hWithSpacing = 1
      } else {
        hWithSpacing = Math.max(0, hWithSpacing)
      }
      if (this.isVertical() && isNegative) {
        yWithSpacing = y + stackSpacing
      }
    }

    const cornerRadius = config.roundedCorners
      ? isNumber(config.roundedCorners) ? +config.roundedCorners : width / 2
      : 0
    const cornerRadiusClamped = clamp(cornerRadius, 0, Math.min(hWithSpacing, width) / 2)
    const isNorthDirected = this.yScale.range()[0] > this.yScale.range()[1]

    const allCornersRounded = stackSpacing > 0 && !!config.roundedCorners
    return roundedRectPath({
      x: this.isVertical() ? x : yWithSpacing - hWithSpacing,
      y: this.isVertical() ? yWithSpacing + (isNorthDirected ? 0 : -hWithSpacing) : x,
      w: this.isVertical() ? width : hWithSpacing,
      h: this.isVertical() ? hWithSpacing : width,
      tl: allCornersRounded || (isEnding && (this.isVertical()
        ? (!isNegative && isNorthDirected) || (isNegative && !isNorthDirected)
        : isNegative
      )),
      tr: allCornersRounded || (isEnding && (this.isVertical()
        ? (!isNegative && isNorthDirected) || (isNegative && !isNorthDirected)
        : !isNegative
      )),
      br: allCornersRounded || (isEnding && (this.isVertical()
        ? (isNegative && isNorthDirected) || (!isNegative && !isNorthDirected)
        : !isNegative
      )),
      bl: allCornersRounded || (isEnding && (this.isVertical()
        ? (isNegative && isNorthDirected) || (!isNegative && !isNorthDirected)
        : isNegative
      )),
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
