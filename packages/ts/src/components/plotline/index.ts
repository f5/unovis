import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Core
import { XYComponentCore } from 'core/xy-component'

// Config
import { PlotlineDefaultConfig, PlotlineConfigInterface } from './config'

// Styles
import * as s from './style'

export class Plotline<Datum> extends XYComponentCore<Datum, PlotlineConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotlineDefaultConfig as PlotlineConfigInterface<Datum>
  value: number | null | undefined
  plotline: Selection<SVGLineElement, any, SVGLineElement, any>

  constructor (config: PlotlineConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    this.plotline = this.g.append('line')
      .attr('class', s.plotline)
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

    smartTransition(this.plotline.exit())
      .style('opacity', 0)
      .remove()
  }
}
