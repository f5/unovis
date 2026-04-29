import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Core
import { XYComponentCore } from 'core/xy-component'
import { AxisType } from 'components/axis/types'

// Types
import { PlotLabelLayout, PlotLabelLayoutInfo, LabelOverflow } from 'types/plot-label'

// Config
import { LINE_STYLE, VERTICAL_X, HORIZONTAL_X, VERTICAL_Y, HORIZONTAL_Y } from './constants'
import { PlotlineDefaultConfig, PlotlineConfigInterface } from './config'
import { PlotlineLabelPosition, PlotlineLabelOrientation, PlotlineLabelLayout, PlotlineLayoutValue } from './types'

// Styles
import * as s from './style'

// Used as the candidate order (preferred anchor first, then walk this list).
const PLOTLINE_CLOCKWISE: readonly PlotlineLabelPosition[] = [
  PlotlineLabelPosition.TopLeft,
  PlotlineLabelPosition.Top,
  PlotlineLabelPosition.TopRight,
  PlotlineLabelPosition.Right,
  PlotlineLabelPosition.BottomRight,
  PlotlineLabelPosition.Bottom,
  PlotlineLabelPosition.BottomLeft,
  PlotlineLabelPosition.Left,
] as const

export class Plotline<Datum> extends XYComponentCore<Datum, PlotlineConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotlineDefaultConfig as PlotlineConfigInterface<Datum>
  value: number | null | undefined
  plotline: Selection<SVGLineElement, unknown, null, undefined>
  label: Selection<SVGTextElement, unknown, null, undefined>
  // Cached so `getLabelLayoutInfo()` can recompute layouts for alternative
  // anchors without re-deriving the line endpoints.
  private _labelLayoutBounds: { width: number; height: number } | undefined

  constructor (config: PlotlineConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    this.plotline = this.g
      .append('line')
      .attr('class', s.plotline)

    this.label = this.g
      .append('text')
      .attr('class', s.label)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this
    this.value = config.value

    let strokeDashArray

    if (typeof config?.lineStyle === 'string') {
      strokeDashArray = LINE_STYLE[config.lineStyle]
    } else if (Array.isArray(config.lineStyle)) {
      strokeDashArray = config.lineStyle.join(',')
    } else {
      strokeDashArray = 'none'
    }

    this.value = config.value

    this.plotline
      .attr('stroke-opacity', 1)
      .style('stroke-width', config.lineWidth)
      .style('stroke-dasharray', strokeDashArray)
      .style('stroke', config.color)

    let x1 = 0
    let x2 = 0
    let y1 = 0
    let y2 = 0

    if (config.axis === AxisType.Y) {
      y1 = this.yScale(this.value)
      y2 = this.yScale(this.value)
      x1 = 0
      x2 = this._width
    } else {
      y1 = 0
      y2 = this._height
      x1 = this.xScale(this.value)
      x2 = this.xScale(this.value)
    }

    smartTransition(this.plotline, config.duration)
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', y1)
      .attr('y2', y2)

    if (config.labelText) {
      this._labelLayoutBounds = { width: x2, height: y2 }
      const labelProps = this.computeLabel(
        config.axis,
        x2,
        y2,
        config.labelPosition,
        config.labelOffsetX,
        config.labelOffsetY,
        config.labelOrientation
      )

      this.label
        .text(config.labelText)
        .attr('transform', labelProps.transform)
        .attr('dominant-baseline', labelProps.dominantBaseline)
        .style('fill', config.labelColor)
        .style('text-anchor', labelProps.textAnchor)
        .style('font-size', config.labelSize ? `${config.labelSize}px` : undefined)

      smartTransition(this.label, config.duration)
        .attr('x', labelProps.x)
        .attr('y', labelProps.y)
    } else {
      // Wipe stale text from a prior render where labelText was set.
      this._labelLayoutBounds = undefined
      this.label.text('')
    }

    smartTransition(this.plotline.exit())
      .style('opacity', 0)
      .remove()
  }

  private computeLabel (
    axis: AxisType | string,
    width: number,
    height: number,
    position: PlotlineLabelPosition,
    offsetX: number,
    offsetY: number,
    orientation: PlotlineLabelOrientation
  ): PlotlineLabelLayout {
    const isVertical = orientation === PlotlineLabelOrientation.Vertical
    const rotation = isVertical ? -90 : 0

    let layout: PlotlineLayoutValue

    if (axis === AxisType.X) {
      const map = isVertical ? VERTICAL_X : HORIZONTAL_X
      layout = map[position]({ width, height, offsetX, offsetY })
    } else {
      const map = isVertical ? VERTICAL_Y : HORIZONTAL_Y
      layout = map[position]({ width, height, offsetX, offsetY })
    }

    const transform = rotation ? `rotate(${rotation}, ${layout.x}, ${layout.y})` : ''

    return {
      ...layout,
      rotation,
      transform,
    }
  }

  // Read by `XYContainer` to coordinate auto label positioning across
  // Plotline + Plotband siblings.
  public getLabelLayoutInfo (): PlotLabelLayoutInfo | null {
    const { config } = this
    if (!config.labelText || !this._labelLayoutBounds) return null

    const labelEl = this.label.node()
    const preferred = config.labelPosition ?? PlotlineLabelPosition.TopRight
    const preferredIdx = PLOTLINE_CLOCKWISE.indexOf(preferred)
    const candidates = preferredIdx >= 0
      ? [...PLOTLINE_CLOCKWISE.slice(preferredIdx), ...PLOTLINE_CLOCKWISE.slice(0, preferredIdx)]
      : [preferred, ...PLOTLINE_CLOCKWISE]

    const bounds = this._labelLayoutBounds
    const computeLayout = (anchor: string): PlotLabelLayout => {
      const layout = this.computeLabel(
        config.axis,
        bounds.width,
        bounds.height,
        anchor as PlotlineLabelPosition,
        config.labelOffsetX,
        config.labelOffsetY,
        config.labelOrientation
      )
      return {
        x: layout.x,
        y: layout.y,
        transform: layout.transform,
        textAnchor: layout.textAnchor,
        dominantBaseline: layout.dominantBaseline,
      }
    }

    return {
      labelEl,
      preferredAnchor: preferred,
      candidates,
      participatesInAuto: !!config.labelAutoPosition,
      overflow: config.labelOverflow ?? LabelOverflow.Smart,
      computeLayout,
    }
  }
}
