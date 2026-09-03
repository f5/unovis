import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from '@/utils/d3'
import { renderTextToSvgTextElement } from '@/utils/text'
import { isString } from '@/utils/data'

// Core
import { XYComponentCore } from '@/core/xy-component'
import { AxisType } from '@/components/axis/types'

// Types
import { PlotLabelLayout, PlotLabelLayoutInfo, LabelOverflow } from '@/types/plot-label'
import { getTextAnchorFromTextAlign } from '@/types/svg'

// Config
import { VERTICAL_X, HORIZONTAL_X, VERTICAL_Y, HORIZONTAL_Y } from './constants'
import { PlotbandDefaultConfig, PlotbandConfigInterface } from './config'
import { PlotbandLabelOrientation, PlotbandLabelPosition, PlotbandLabelLayout } from './types'

// Styles
import * as s from './style'


export class Plotband<Datum> extends XYComponentCore<Datum, PlotbandConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotbandDefaultConfig as PlotbandConfigInterface<Datum>
  from: number | null | undefined
  to: number | null | undefined
  plotband: Selection<SVGRectElement, unknown, null, undefined>
  label: Selection<SVGTextElement, unknown, null, undefined>
  // Cached so `getLabelLayoutInfo()` can recompute layouts for alternative
  // anchors without re-deriving the band rect.
  private _labelLayoutBounds: { startX: number; startY: number; width: number; height: number } | undefined

  constructor (config: PlotbandConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    this.plotband = this.g.append('rect')
      .attr('class', s.plotband)

    this.label = this.g
      .append('text')
      .attr('class', s.label)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this
    this.from = config.from
    this.to = config.to

    this.plotband
      .style('fill', config.color)

    if (this.from == null || this.to == null) return

    let x = 0
    let y = 0
    let width = 0
    let height = 0

    if (config.axis === 'y') {
      const y1 = this.yScale(this.from)
      const y2 = this.yScale(this.to)
      y = Math.min(y1, y2)
      height = Math.abs(y1 - y2)
      x = 0
      width = this._width
    } else {
      const x1 = this.xScale(this.from)
      const x2 = this.xScale(this.to)
      x = Math.min(x1, x2)
      width = Math.abs(x1 - x2)
      y = 0
      height = this._height
    }

    smartTransition(this.plotband, config.duration)
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height)

    if (config.labelText) {
      this._labelLayoutBounds = { startX: x, startY: y, width, height }
      const labelProps = this.computeLabel(
        config.axis,
        x,
        y,
        width,
        height,
        config.labelPosition,
        config.labelOffsetX,
        config.labelOffsetY,
        config.labelOrientation
      )

      if (isString(config.labelText)) {
        this.label.text(config.labelText)
      } else {
        renderTextToSvgTextElement(this.label.node(), config.labelText, {})
      }

      this.label
        .attr('transform', null)
        .style('text-anchor', getTextAnchorFromTextAlign(labelProps.textAlign))
        .style('fill', config.labelColor)
        .style('font-size', config.labelSize ? `${config.labelSize}px` : undefined)
        .attr('x', labelProps.x)
        .attr('y', labelProps.y)

      const bbox = this.label.node()?.getBBox()
      const cx = bbox ? labelProps.x + Math.max(0, -bbox.x) - Math.max(0, bbox.x + bbox.width - this._width) : labelProps.x
      const cy = bbox ? labelProps.y + Math.max(0, -bbox.y) - Math.max(0, bbox.y + bbox.height - this._height) : labelProps.y

      smartTransition(this.label, config.duration)
        .attr('x', cx)
        .attr('y', cy)
        .attr('transform', labelProps.rotation ? `rotate(${labelProps.rotation}, ${cx}, ${cy})` : null)
    } else {
      // Wipe stale text from a prior render where labelText was set.
      this._labelLayoutBounds = undefined
      this.label.text('')
    }

    smartTransition(this.plotband.exit())
      .style('opacity', 0)
      .remove()
  }

  private computeLabel (
    axis: AxisType,
    startX: number,
    startY: number,
    width: number,
    height: number,
    position: PlotbandLabelPosition,
    offsetX: number,
    offsetY: number,
    orientation: PlotbandLabelOrientation
  ): PlotbandLabelLayout {
    const isVertical = orientation === 'vertical'
    const rotation = isVertical ? -90 : 0
    const args = { startX, startY, width, height, offsetX, offsetY }

    const layoutMap = axis === AxisType.X
      ? (isVertical ? VERTICAL_X : HORIZONTAL_X)
      : (isVertical ? VERTICAL_Y : HORIZONTAL_Y)
    const layoutFn = Object.prototype.hasOwnProperty.call(layoutMap, position)
      ? layoutMap[position]
      : layoutMap[PlotbandLabelPosition.TopLeftOutside]
    const layoutPartial = layoutFn(args)

    const { x, y, textAlign, verticalAlign } = layoutPartial

    return { x, y, rotation, textAlign, verticalAlign }
  }

  // Read by `XYContainer` to coordinate auto label positioning across
  // Plotline + Plotband siblings.
  public getLabelLayoutInfo (): PlotLabelLayoutInfo | null {
    const { config } = this
    if (!config.labelText || !this._labelLayoutBounds) return null

    const labelEl = this.label.node()
    const preferred = config.labelPosition ?? PlotbandLabelPosition.TopLeftOutside
    const bounds = this._labelLayoutBounds
    const computeLayout = (anchor: string): PlotLabelLayout => {
      const layout = this.computeLabel(
        config.axis,
        bounds.startX,
        bounds.startY,
        bounds.width,
        bounds.height,
        anchor as PlotbandLabelPosition,
        config.labelOffsetX,
        config.labelOffsetY,
        config.labelOrientation
      )
      return {
        x: layout.x,
        y: layout.y,
        rotation: layout.rotation,
        textAlign: layout.textAlign,
        verticalAlign: layout.verticalAlign,
      }
    }

    return {
      labelEl,
      preferredAnchor: preferred,
      participatesInAuto: !!config.labelAutoPosition,
      overflow: config.labelOverflow ?? LabelOverflow.Stack,
      computeLayout,
    }
  }
}
