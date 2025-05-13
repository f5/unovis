import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Core
import { XYComponentCore } from 'core/xy-component'

// Config
import { PlotbandDefaultConfig, PlotbandConfigInterface } from './config'

// Styles
import * as s from './style'
import { AxisType } from 'components/axis/types'
import { PlotbandLabelOrientation, PlotbandLabelPosition } from './types'

export class Plotband<Datum> extends XYComponentCore<Datum, PlotbandConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotbandDefaultConfig as PlotbandConfigInterface<Datum>
  from: number | null | undefined
  to: number | null | undefined
  plotband: Selection<SVGRectElement, any, SVGRectElement, any>
  label: Selection<SVGTextElement, any, SVGTextElement, any>

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

    const pos = { x: 0, y: 0, width: 0, height: 0 }

    if (config.axis === 'y') {
      const y1 = this.yScale(this.from)
      const y2 = this.yScale(this.to)
      pos.y = Math.min(y1, y2)
      pos.height = Math.abs(y1 - y2)
      pos.x = 0
      pos.width = this._width
    } else {
      const x1 = this.xScale(this.from)
      const x2 = this.xScale(this.to)
      pos.x = Math.min(x1, x2)
      pos.width = Math.abs(x1 - x2)
      pos.y = 0
      pos.height = this._height
    }

    smartTransition(this.plotband, 300)
      .attr('x', pos.x)
      .attr('y', pos.y)
      .attr('width', pos.width)
      .attr('height', pos.height)

    if (config.labelText) {
      const labelProps = this.computeLabel(
        config.axis,
        pos.x,
        pos.y,
        pos.width,
        pos.height,
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

    smartTransition(this.plotband.exit())
      .style('opacity', 0)
      .remove()
  }

  private computeLabel (
    axis: AxisType | string,
    startX: number,
    startY: number,
    width: number,
    height: number,
    position: PlotbandLabelPosition,
    offsetX: number,
    offsetY: number,
    orientation: PlotbandLabelOrientation | string
  ): {
      x: number;
      y: number;
      rotation: number;
      textAnchor: string;
      transform: string;
      dominantBaseline: string;
    } {
    let x = 0
    let y = 0
    let textAnchor = 'start'

    const isVertical = orientation === 'vertical'
    const rotation = isVertical ? -90 : 0

    let dominantBaseline = 'middle'

    if (axis === AxisType.X) {
      switch (position) {
        case PlotbandLabelPosition.TopLeftOutside:
          x = startX - offsetX
          y = offsetY
          textAnchor = 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-before-edge'
          break
        case PlotbandLabelPosition.TopLeftInside:
          x = startX + offsetX
          y = offsetY
          textAnchor = isVertical ? 'end' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-before-edge'
          break
        case PlotbandLabelPosition.TopOutside:
        case PlotbandLabelPosition.TopInside:
          x = startX + width / 2
          y = offsetY
          textAnchor = isVertical ? 'end' : 'middle'
          dominantBaseline = isVertical ? 'middle' : 'text-before-edge'
          break
        case PlotbandLabelPosition.TopRightOutside:
          x = startX + width + offsetX
          y = offsetY
          textAnchor = isVertical ? 'end' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-before-edge'
          break
        case PlotbandLabelPosition.TopRightInside:
          x = startX + width - offsetX
          y = offsetY
          textAnchor = isVertical ? 'end' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-before-edge'
          break
        case PlotbandLabelPosition.RightOutside:
          x = startX + width + offsetX
          y = height / 2
          textAnchor = isVertical ? 'middle' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'middle'
          break
        case PlotbandLabelPosition.RightInside:
          x = startX + width - offsetX
          y = height / 2
          textAnchor = isVertical ? 'middle' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'middle'
          break
        case PlotbandLabelPosition.BottomRightOutside:
          x = startX + width + offsetX
          y = height - offsetY
          textAnchor = 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-after-edge'
          break
        case PlotbandLabelPosition.BottomRightInside:
          x = startX + width - offsetX
          y = height - offsetY
          textAnchor = isVertical ? 'start' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-after-edge'
          break
        case PlotbandLabelPosition.BottomOutside:
        case PlotbandLabelPosition.BottomInside:
          x = startX + width / 2
          y = height - offsetY
          textAnchor = isVertical ? 'start' : 'middle'
          dominantBaseline = isVertical ? 'middle' : 'text-after-edge'
          break
        case PlotbandLabelPosition.BottomLeftOutside:
          x = startX - offsetX
          y = height - offsetY
          textAnchor = isVertical ? 'start' : 'end'
          dominantBaseline = 'text-after-edge'
          break
        case PlotbandLabelPosition.BottomLeftInside:
          x = startX + offsetX
          y = height - offsetY
          textAnchor = 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-after-edge'
          break
        case PlotbandLabelPosition.LeftOutside:
          x = startX - offsetX
          y = height / 2
          textAnchor = isVertical ? 'middle' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'middle'
          break
        case PlotbandLabelPosition.LeftInside:
          x = startX + offsetX
          y = height / 2
          textAnchor = isVertical ? 'middle' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'middle'
          break
      }
    } else {
      switch (position) {
        case PlotbandLabelPosition.TopLeftOutside:
          x = offsetX
          y = startY - offsetY
          textAnchor = 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-after-edge'
          break
        case PlotbandLabelPosition.TopLeftInside:
          x = offsetX
          y = startY + offsetY
          textAnchor = isVertical ? 'end' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-before-edge'
          break
        case PlotbandLabelPosition.TopOutside:
          x = startX + width / 2
          y = startY - offsetY
          textAnchor = isVertical ? 'start' : 'middle'
          dominantBaseline = isVertical ? 'central' : 'text-after-edge'
          break
        case PlotbandLabelPosition.TopInside:
          x = startX + width / 2
          y = startY + offsetY
          textAnchor = isVertical ? 'end' : 'middle'
          dominantBaseline = isVertical ? 'central' : 'text-before-edge'
          break
        case PlotbandLabelPosition.TopRightOutside:
          x = width - offsetX
          y = startY - offsetY
          textAnchor = isVertical ? 'start' : 'end'
          dominantBaseline = 'text-after-edge'
          break
        case PlotbandLabelPosition.TopRightInside:
          x = width - offsetX
          y = startY + offsetY
          textAnchor = isVertical ? 'end' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-before-edge'
          break
        case PlotbandLabelPosition.RightOutside:
        case PlotbandLabelPosition.RightInside:
          x = width - offsetX
          y = startY + height / 2
          textAnchor = isVertical ? 'middle' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'middle'
          break
        case PlotbandLabelPosition.BottomRightOutside:
          x = width - offsetX
          y = startY + height + offsetY
          textAnchor = 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-before-edge'
          break
        case PlotbandLabelPosition.BottomRightInside:
          x = width - offsetX
          y = startY + height - offsetY
          textAnchor = isVertical ? 'start' : 'end'
          dominantBaseline = isVertical ? 'text-after-edge' : 'text-after-edge'
          break
        case PlotbandLabelPosition.BottomOutside:
          x = width / 2
          y = startY + height + offsetY
          textAnchor = isVertical ? 'end' : 'middle'
          dominantBaseline = isVertical ? 'central' : 'text-before-edge'
          break
        case PlotbandLabelPosition.BottomInside:
          x = width / 2
          y = startY + height - offsetY
          textAnchor = isVertical ? 'start' : 'middle'
          dominantBaseline = isVertical ? 'central' : 'text-after-edge'
          break
        case PlotbandLabelPosition.BottomLeftOutside:
          x = offsetX
          y = startY + height + offsetY
          textAnchor = isVertical ? 'end' : 'start'
          dominantBaseline = 'text-before-edge'
          break
        case PlotbandLabelPosition.BottomLeftInside:
          x = offsetX
          y = startY + height - offsetY
          textAnchor = isVertical ? 'start' : 'start'
          dominantBaseline = isVertical ? 'text-before-edge' : 'text-after-edge'
          break
      }
    }

    const transform = rotation !== 0 ? `rotate(${rotation}, ${x}, ${y})` : ''

    return { x, y, rotation, textAnchor, transform, dominantBaseline }
  }
}
