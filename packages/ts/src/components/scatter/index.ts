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
  private _firstRender = true

  constructor (config?: ScatterConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    window.addEventListener('keypress', (event) => {
      console.log(event)
      this.collide()
      this._render()
    })
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

  collide (): void {
    const pointsFlat = flatten(this._pointData)

    pointsFlat.forEach(p => p._point.color = null)
    for (let k = 0; k < 200; k++) {
      // for (let i = 0; i < pointsFlat.length; i += 1) {
      //   const p = pointsFlat[i]
      //   const dx = p._point.xValue - p._point.xValueInitial
      //   const dy = p._point.yValue - p._point.yValueInitial
      //   const dist = Math.sqrt(dx * dx + dy * dy)
      //   const angle = Math.atan2(dy, dx)
      //   // p._point.xValue -= dist / 25 * Math.cos(angle)
      //   p._point.yValue -= dist / 100 * Math.sin(angle)
      // }

      for (let i = 0; i < pointsFlat.length; i += 1) {
        const p = pointsFlat[i]
        const py = this.yScale(p._point.yValue)
        const pr = p._point.sizePx / 2

        if (py < pr) p._point.yValue = this.yScale.invert(pr)
        else if (py + pr >= this._height) p._point.yValue = this.yScale.invert(this._height - pr)
      }

      for (let i = 0; i < pointsFlat.length; i += 1) {
        const p1 = pointsFlat[i]
        const p1x = this.xScale(p1._point.xValue)
        const p1y = this.yScale(p1._point.yValue)// + Math.random()// Number.EPSILON
        const p1r = p1._point.sizePx / 2
        for (let j = i + 1; j < pointsFlat.length; j += 1) {
          const p2 = pointsFlat[j]
          const p2x = this.xScale(p2._point.xValue)
          const p2y = this.yScale(p2._point.yValue)// - Math.random()// Number.EPSILON
          const p2r = p2._point.sizePx / 2

          const dx = p2x - p1x
          const dy = p2y - p1y
          // const dist = Math.sqrt(dx * dx + dy * dy)

          const rSum = (p1r + p2r)
          const overlapX = dx - rSum
          const overlapY = dy - rSum
          if (overlapX < 0) {
            let step = rSum / dy / 5
            if (Math.abs(step) > 20) step = Math.sign(step) * 20

            p1._point.yValue = this.yScale.invert(p1y - step * p2r / rSum)// * p2r * p2r / (p1r * p1r + p2r * p2r))
            p2._point.yValue = this.yScale.invert(p2y + step * p1r / rSum)// * p1r * p1r / (p1r * p1r + p2r * p2r))
          }
        }
      }
    }

    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < pointsFlat.length; i += 1) {
        const p1 = pointsFlat[i]
        const p1x = this.xScale(p1._point.xValue)
        const p1y = this.yScale(p1._point.yValue) + 0.001// Number.EPSILON
        const p1r = p1._point.sizePx / 2
        for (let j = i + 1; j < pointsFlat.length; j += 1) {
          const p2 = pointsFlat[j]
          const p2x = this.xScale(p2._point.xValue)
          const p2y = this.yScale(p2._point.yValue) - 0.001// Number.EPSILON
          const p2r = p2._point.sizePx / 2

          const dx = p2x - p1x
          const dy = p2y - p1y
          const overlap = (p1r + p2r) - Math.sqrt(dx * dx + dy * dy)
          if (overlap > 0) {
            if (overlap > 1) {
              // p1._point.color = 'red'
              // p2._point.color = 'red'
            }

            const angle = Math.atan2(dy, dx)
            // p1._point.xValuePx = p1x - overlap / 2 * Math.cos(angle)
            // p2._point.xValuePx = p2x + overlap / 2 * Math.cos(angle)
            //
            // p1._point.yValuePx = p1y - overlap / 2 * Math.sin(angle)
            // p2._point.yValuePx = p2y + overlap / 2 * Math.sin(angle)

            // p1._point.xValue = this.xScale.invert(p1x - overlap / 2 * Math.cos(angle))
            // p2._point.xValue = this.xScale.invert(p2x + overlap / 2 * Math.cos(angle))

            p1._point.yValue = this.yScale.invert(p1y - overlap / 3 * Math.sin(angle) * p2r * p2r / (p1r * p1r + p2r * p2r))
            p2._point.yValue = this.yScale.invert(p2y + overlap / 3 * Math.sin(angle) * p1r * p1r / (p1r * p1r + p2r * p2r))

            // p1._point.xValue = this.xScale.invert(p1x - overlap / 2 * Math.cos(angle * 1.05))
            // p2._point.xValue = this.xScale.invert(p2x + overlap / 2 * Math.cos(angle * 1.05))

            // const oy = (p1r + p2r) - (p2y - p1y)
            // p1._point.yValue = this.yScale.invert(p1y + oy / 2)
            // p2._point.yValue = this.yScale.invert(p2y - oy / 2)
          }
        }
      }
    }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    if (this._firstRender) this._pointData = this._getOnScreenData()

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
      .selectAll<SVGPathElement, ScatterPoint<Datum>>(`.${s.point}`)
      .data(
        d => d,
        d => `${getString(d, config.id, d._point.pointIndex) ?? d._point.pointIndex}`
      )

    const pointsEnter = points.enter().append('g')
      .attr('class', s.point)
    createPoints(pointsEnter, this.xScale, this.yScale)

    this._points = pointsEnter.merge(points)
    updatePoints(this._points, config, this.xScale, this.yScale, duration)

    removePoints(points.exit(), this.xScale, this.yScale, duration)

    // Take care of overlapping labels
    this._collideLabels()

    this._firstRender = false
  }

  private _collideLabels (): void {
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

    const points = yAccessors.map((y, j) => {
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
              xValueInitial: xValue,
              yValueInitial: yValue,
              xValuePx: this.xScale(xValue),
              yValuePx: this.yScale(yValue),
              size: pointSize,
              sizePx: pointSizeScaled,
              color: getColor(d, config.color, j),
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

    return points
  }

  private _onPointMouseOver (d: ScatterPoint<Datum>, event: MouseEvent): void {
    const point = select(event.target as SVGGElement)
    const pointNode = point.node() as ScatterPointGroupNode | null
    if (pointNode) pointNode._forceShowLabel = true

    point.raise()
    this._collideLabels()
  }

  private _onPointMouseOut (d: ScatterPoint<Datum>, event: MouseEvent): void {
    const pointNode = select(event.target as SVGGElement).node() as ScatterPointGroupNode | null
    if (pointNode) delete pointNode._forceShowLabel

    this._collideLabels()
  }
}
