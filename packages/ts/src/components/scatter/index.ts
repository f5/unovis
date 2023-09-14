import { Selection, select } from 'd3-selection'
import { max, min } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, getExtent, getNumber, getString, isArray, flatten, getValue } from 'utils/data'
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'
import { getCSSVariableValueInPixels } from 'utils/misc'

// Types
import { Spacing } from 'types/spacing'
import { SymbolType } from 'types/symbol'
import { NumericAccessor } from 'types/accessor'

// Local Types
import { ScatterPointGroupNode, ScatterPoint } from './types'

// Config
import { ScatterConfig, ScatterConfigInterface } from './config'

// Modules
import { createPoints, updatePoints, removePoints } from './modules/point'
import { collideLabels, getEstimatedLabelBBox } from './modules/utils'

// Styles
import * as s from './style'

export class Scatter<Datum> extends XYComponentCore<Datum, ScatterConfig<Datum>, ScatterConfigInterface<Datum>> {
  static selectors = s
  config: ScatterConfig<Datum> = new ScatterConfig()
  events = {
    [Scatter.selectors.point]: {
      mouseenter: this._onPointMouseOver.bind(this),
      mouseleave: this._onPointMouseOut.bind(this),
    },
  }

  private _pointData: ScatterPoint<Datum>[][] = []
  private _points: Selection<SVGGElement, ScatterPoint<Datum>, SVGGElement, ScatterPoint<Datum>[]>
  private _collideLabelsAnimFrameId: ReturnType<typeof requestAnimationFrame>

  constructor (config?: ScatterConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
  }

  setConfig (config: ScatterConfigInterface<Datum>): void {
    super.setConfig(config)
    this._updateSizeScale()
  }

  setData (data: Datum[]): void {
    super.setData(data)
    this._updateSizeScale()
  }

  get bleed (): Spacing {
    this._pointData = this._getOnScreenData()
    const pointDataFlat: ScatterPoint<Datum>[] = flatten(this._pointData)

    const yRangeStart = min(this.yScale.range())
    const yRangeEnd = max(this.yScale.range())
    const xRangeStart = this.xScale.range()[0]
    const xRangeEnd = this.xScale.range()[1]

    const fontSizePx = getCSSVariableValueInPixels('var(--vis-scatter-point-label-text-font-size)', this.element)

    const extent = pointDataFlat.reduce((ext, d) => {
      const labelPosition = getValue(d, this.config.labelPosition, d._point.pointIndex)
      const labelBBox = getEstimatedLabelBBox(d, labelPosition, this.xScale, this.yScale, fontSizePx)
      const x = this.xScale(d._point.xValue)
      const y = this.yScale(d._point.yValue)
      const r = d._point.sizePx / 2

      ext.minX = Math.min(ext.minX, x - r, labelBBox.x)
      ext.maxX = Math.max(ext.maxX, x + r, labelBBox.x + labelBBox.width)
      ext.minY = Math.min(ext.minY, y - r, labelBBox.y)
      ext.maxY = Math.max(ext.maxY, y + r, labelBBox.y + labelBBox.height)
      return ext
    }, {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    })

    const coeff = 1.2 // Multiplier to take into account subsequent scale range changes and shape irregularities
    const top = extent.minY < yRangeStart ? coeff * (yRangeStart - extent.minY) : 0
    const bottom = extent.maxY > yRangeEnd ? coeff * (extent.maxY - yRangeEnd) : 0
    const left = extent.minX < xRangeStart ? coeff * (xRangeStart - extent.minX) : 0
    const right = extent.maxX > xRangeEnd ? coeff * (extent.maxX - xRangeEnd) : 0

    return { top, bottom, left, right }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    // Groups
    const pointGroups = this.g
      .selectAll<SVGGElement, ScatterPoint<Datum>[]>(`.${s.pointGroup}`)
      .data(this._pointData)

    const pointGroupsEnter = pointGroups
      .enter()
      .append('g')
      .attr('class', s.pointGroup)

    const pointGroupsMerged = pointGroupsEnter.merge(pointGroups)
    smartTransition(pointGroupsMerged, duration)
      .style('opacity', 1)

    const pointGroupExit = pointGroups.exit().attr('class', s.pointGroupExit)
    smartTransition(pointGroupExit, duration).style('opacity', 0).remove()

    // Points
    const points = pointGroupsMerged
      .selectAll<SVGGElement, ScatterPoint<Datum>>(`.${s.point}`)
      .data(
        d => d,
        d => `${getString(d, config.id, d._point.pointIndex) ?? d._point.pointIndex}`
      )

    const pointsEnter = points.enter().append('g')
      .attr('class', s.point)
    createPoints(pointsEnter, this.xScale, this.yScale)

    this._points = pointsEnter.merge(points)
    updatePoints(this._points, config, this.xScale, this.yScale, duration)

    removePoints(points.exit<ScatterPoint<Datum>>(), this.xScale, this.yScale, duration)

    // Take care of overlapping labels
    this._resolveLabelOverlap()
  }

  private _resolveLabelOverlap (): void {
    if (!this.config.labelHideOverlapping) {
      const label = this._points.selectAll<SVGTextElement, ScatterPoint<Datum>>('text')
      label.attr('opacity', null)
      return
    }

    cancelAnimationFrame(this._collideLabelsAnimFrameId)
    this._collideLabelsAnimFrameId = requestAnimationFrame(() => {
      collideLabels(this._points, this.config, this.xScale, this.yScale)
    })
  }

  private _updateSizeScale (): void {
    const { config, datamodel } = this

    config.sizeScale
      .domain(getExtent(datamodel.data, config.size))
      .range(config.sizeRange ?? [0, 0])
  }

  private _getOnScreenData (): ScatterPoint<Datum>[][] {
    const { config, datamodel: { data } } = this

    const xDomain = this.xScale.domain().map(d => +d) // Convert Date to number
    const yDomain = this.yScale.domain().map(d => +d) // Convert Date to number
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]

    const maxSizeValue = max<number>(flatten(yAccessors.map((y, j) => data?.map(d => getNumber(d, config.size, j)))))
    const maxSizePx = config.sizeRange ? config.sizeScale(maxSizeValue) : maxSizeValue
    const maxSizeXDomain = (this.xScale.invert(maxSizePx) as number) - (this.xScale.invert(0) as number)
    const maxSizeYDomain = Math.abs((this.yScale.invert(maxSizePx) as number) - (this.yScale.invert(0) as number))

    return yAccessors.map((y, j) => {
      return data?.reduce<ScatterPoint<Datum>[]>((acc, d, i) => {
        const xValue = getNumber(d, config.x, i)
        const yValue = getNumber(d, y, j)
        const pointSize = getNumber(d, config.size, i)
        const pointSizeScaled = config.sizeRange ? config.sizeScale(pointSize) : pointSize
        const pointSizeXDomain = (this.xScale.invert(pointSizeScaled) as number) - (this.xScale.invert(0) as number)
        const pointSizeYDomain = Math.abs((this.yScale.invert(pointSizeScaled) as number) - (this.yScale.invert(0) as number))

        if (
          ((xValue - pointSizeXDomain / 2) >= (xDomain[0] - maxSizeXDomain / 2)) &&
          ((xValue + pointSizeXDomain / 2) <= (xDomain[1] + maxSizeXDomain / 2)) &&
          ((yValue - pointSizeYDomain / 2) >= (yDomain[0] - maxSizeYDomain / 2)) &&
          ((yValue + pointSizeYDomain / 2) <= (yDomain[1] + maxSizeYDomain / 2))
        ) {
          acc.push({
            ...d,
            _point: {
              xValue: xValue,
              yValue: yValue,
              sizePx: pointSizeScaled,
              color: getColor(d, config.color, j),
              strokeColor: getColor(d, config.strokeColor, j, true),
              strokeWidthPx: getNumber(d, config.strokeWidth, j),
              shape: getString(d, config.shape, j) as SymbolType,
              label: getString(d, config.label, j),
              labelColor: getValue(d, config.labelColor, j),
              cursor: getString(d, config.cursor, j),
              groupIndex: j,
              pointIndex: i,
            },
          })
        }

        return acc
      }, []) ?? []
    })
  }

  private _onPointMouseOver (d: ScatterPoint<Datum>, event: MouseEvent): void {
    const point = select(event.target as SVGGElement)
    const pointNode = point.node() as ScatterPointGroupNode | null
    if (pointNode) pointNode._forceShowLabel = true

    point.raise()
    this._resolveLabelOverlap()
  }

  private _onPointMouseOut (d: ScatterPoint<Datum>, event: MouseEvent): void {
    const pointNode = select(event.target as SVGGElement).node() as ScatterPointGroupNode | null
    if (pointNode) delete pointNode._forceShowLabel

    this._resolveLabelOverlap()
  }

  public getAriaDescription (tickFormat: any): string {
    if (!this.config.configureAriaLabel) {
      return ''
    }
    const points = this.datamodel.data.length
    return `Scatter Plot. There ${points > 1 ? 'are' : 'is'} ${points} ${points > 1 ? 'points' : 'point'} in this plot.`
  }
}
