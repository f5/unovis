import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Core
import { XYComponentCore } from 'core/xy-component'
import { AxisType } from 'components/axis/types'

// Types
import { PlotLabelLayout, PlotLabelLayoutInfo, LabelOverflow } from 'types/plot-label'

// Config
import { VERTICAL_X, HORIZONTAL_X, VERTICAL_Y, HORIZONTAL_Y } from './constants'
import { PlotbandDefaultConfig, PlotbandConfigInterface } from './config'
import { PlotbandLabelOrientation, PlotbandLabelPosition, PlotbandLabelLayout } from './types'

// Styles
import * as s from './style'

// Outside ring clockwise, then inside ring clockwise. Used as the candidate
// order (preferred anchor first, then walk this list).
const PLOTBAND_CLOCKWISE: readonly PlotbandLabelPosition[] = [
  PlotbandLabelPosition.TopLeftOutside,
  PlotbandLabelPosition.TopOutside,
  PlotbandLabelPosition.TopRightOutside,
  PlotbandLabelPosition.RightOutside,
  PlotbandLabelPosition.BottomRightOutside,
  PlotbandLabelPosition.BottomOutside,
  PlotbandLabelPosition.BottomLeftOutside,
  PlotbandLabelPosition.LeftOutside,
  PlotbandLabelPosition.TopLeftInside,
  PlotbandLabelPosition.TopInside,
  PlotbandLabelPosition.TopRightInside,
  PlotbandLabelPosition.RightInside,
  PlotbandLabelPosition.BottomRightInside,
  PlotbandLabelPosition.BottomInside,
  PlotbandLabelPosition.BottomLeftInside,
  PlotbandLabelPosition.LeftInside,
] as const

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

      this.label
        .text(config.labelText)
        .attr('dominant-baseline', labelProps.dominantBaseline)
        .attr('transform', labelProps.transform)
        .style('text-anchor', labelProps.textAnchor)
        .style('fill', config.labelColor)
        .style('font-size', config.labelSize ? `${config.labelSize}px` : undefined)

      smartTransition(this.label, config.duration)
        .attr('x', labelProps.x)
        .attr('y', labelProps.y)
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

    let layoutPartial: Omit<PlotbandLabelLayout, 'rotation' | 'transform'>

    if (axis === AxisType.X) {
      layoutPartial = (isVertical ? VERTICAL_X : HORIZONTAL_X)[position](args)
    } else {
      layoutPartial = (isVertical ? VERTICAL_Y : HORIZONTAL_Y)[position](args)
    }

    const { x, y, textAnchor, dominantBaseline } = layoutPartial
    const transform = rotation !== 0 ? `rotate(${rotation}, ${x}, ${y})` : ''

    return { x, y, rotation, textAnchor, transform, dominantBaseline }
  }

  // Read by `XYContainer` to coordinate auto label positioning across
  // Plotline + Plotband siblings.
  public getLabelLayoutInfo (): PlotLabelLayoutInfo | null {
    const { config } = this
    if (!config.labelText || !this._labelLayoutBounds) return null

    const labelEl = this.label.node()
    const preferred = config.labelPosition ?? PlotbandLabelPosition.TopLeftOutside
    const preferredIdx = PLOTBAND_CLOCKWISE.indexOf(preferred)
    const candidates = preferredIdx >= 0
      ? [...PLOTBAND_CLOCKWISE.slice(preferredIdx), ...PLOTBAND_CLOCKWISE.slice(0, preferredIdx)]
      : [preferred, ...PLOTBAND_CLOCKWISE]

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
