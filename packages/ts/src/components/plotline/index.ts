import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Core
import { XYComponentCore } from 'core/xy-component'

// Config
import { PlotlineDefaultConfig, PlotlineConfigInterface } from './config'

// Styles
import * as s from './style'
import { PlotlineLegendPosition, PlotlineLegendOrientation } from './types'

export class Plotline<Datum> extends XYComponentCore<Datum, PlotlineConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotlineDefaultConfig as PlotlineConfigInterface<Datum>
  value: number | null | undefined
  plotline: Selection<SVGLineElement, any, SVGLineElement, any>
  label: Selection<SVGTextElement, any, SVGTextElement, any>

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

    const lineStyle = {
      solid: 'none',
      shortDash: '6,2',
      shortDot: '2,2',
      shortDashDot: '6,2,2,2',
      shortDashDotDot: '6,2,2,2,2,2',
      dot: '2,6',
      dash: '8,6',
      longDash: '16,6',
      dashDot: '8,6,2,6',
      longDashDot: '16,6,2,6',
      longDashDotDot: '16,6,2,6,2,6',
    } as const

    let strokeDashArray

    if (typeof config?.lineStyle === 'string') {
      strokeDashArray = lineStyle[config.lineStyle]
    } else if (Array.isArray(config.lineStyle)) {
      strokeDashArray = config.lineStyle.join(',')
    } else {
      strokeDashArray = 'none'
    }

    this.value = config.value

    this.plotline
      .attr('stroke-opacity', 1)
      .attr('stroke-width', config.lineWidth)
      .style('stroke-dasharray', strokeDashArray)
      .style('stroke', config.color)

    const pos = { x1: 0, x2: 0, y1: 0, y2: 0 }

    if (config.axis === 'y') {
      pos.y1 = this.yScale(this.value)
      pos.y2 = this.yScale(this.value)
      pos.x1 = 0
      pos.x2 = this._width
    } else {
      pos.y1 = 0
      pos.y2 = this._height
      pos.x1 = this.xScale(this.value)
      pos.x2 = this.xScale(this.value)
    }

    smartTransition(this.plotline, 300)
      .attr('x1', pos.x1)
      .attr('x2', pos.x2)
      .attr('y1', pos.y1)
      .attr('y2', pos.y2)

    if (config.labelText) {
      const labelProps = this._computeLabel(
        config.axis,
        pos.x2,
        pos.y2,
        config.labelPosition,
        config.labelOffsetX,
        config.labelOffsetY,
        config.labelOrientation
      )

      smartTransition(this.label, 300)
        .text(config.labelText)
        .attr('x', labelProps.x)
        .attr('y', labelProps.y)
        .attr('dominant-baseline', labelProps.dominantBaseline)
        .attr('transform', labelProps.transform)
        .style('text-anchor', labelProps.textAnchor)
        .style('fill', config.labelColor)
        .style('font-size', config.labelSize ? `${config.labelSize}px` : undefined)
    }

    smartTransition(this.plotline.exit())
      .style('opacity', 0)
      .remove()
  }

  _computeLabel (
    axis: 'x' | 'y',
    width: number,
    height: number,
    position: PlotlineLegendPosition,
    offsetX: number,
    offsetY: number,
    orientation: PlotlineLegendOrientation
  ): { x: number; y: number; rotation: number; textAnchor: string; transform: string; dominantBaseline: string } {
    let x = 0
    let y = 0
    let textAnchor = 'start'

    const isVertical = orientation === 'vertical'
    const rotation = isVertical ? -90 : 0

    let dominantBaseline = 'middle'

    if (axis === 'x') {
      switch (position) {
        case 'top-left':
          x = width - offsetX
          y = offsetY
          textAnchor = 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-before-edge'
          break
        case 'top':
          x = width
          y = offsetY
          textAnchor = isVertical ? 'end' : 'middle'
          dominantBaseline = isVertical ? 'middle' : 'text-before-edge'
          break
        case 'top-right':
          x = width + offsetX
          y = offsetY
          textAnchor = isVertical ? 'end' : 'start'
          dominantBaseline = 'text-before-edge'
          break
        case 'right':
          x = width + offsetX
          y = height / 2
          textAnchor = isVertical ? 'middle' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'middle'
          break
        case 'bottom-right':
          x = width + offsetX
          y = height - offsetY
          textAnchor = 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-after-edge'
          break
        case 'bottom':
          x = width
          y = height - offsetY
          textAnchor = isVertical ? 'start' : 'middle'
          dominantBaseline = isVertical ? 'middle' : 'text-after-edge'
          break
        case 'bottom-left':
          x = width - offsetX
          y = height - offsetY
          textAnchor = isVertical ? 'start' : 'end'
          dominantBaseline = 'text-after-edge'
          break
        case 'left':
          x = width - offsetX
          y = height / 2
          textAnchor = isVertical ? 'middle' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'middle'
          break
      }
    } else {
      switch (position) {
        case 'top-left':
          x = offsetX
          y = height - offsetY
          textAnchor = 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-after-edge'
          break
        case 'top':
          x = width / 2
          y = height - offsetY
          textAnchor = isVertical ? 'start' : 'middle'
          dominantBaseline = isVertical ? 'central' : 'text-after-edge'
          break
        case 'top-right':
          x = width - offsetX
          y = height - offsetY
          textAnchor = isVertical ? 'start' : 'end'
          dominantBaseline = 'text-after-edge'
          break
        case 'right':
          x = width - offsetX
          y = height
          textAnchor = isVertical ? 'middle' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'middle'
          break
        case 'bottom-right':
          x = width - offsetX
          y = height + offsetY
          textAnchor = 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-before-edge'
          break
        case 'bottom':
          x = width / 2
          y = height + offsetY
          textAnchor = isVertical ? 'end' : 'middle'
          dominantBaseline = isVertical ? 'central' : 'text-before-edge'
          break
        case 'bottom-left':
          x = offsetX
          y = height + offsetY
          textAnchor = isVertical ? 'end' : 'start'
          dominantBaseline = 'text-before-edge'
          break
        case 'left':
          x = offsetX
          y = height
          textAnchor = isVertical ? 'middle' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'middle'
          break
      }
    }

    const transform = rotation !== 0 ? `rotate(${rotation}, ${x}, ${y})` : ''

    return { x, y, rotation, textAnchor, transform, dominantBaseline }
  }
}
