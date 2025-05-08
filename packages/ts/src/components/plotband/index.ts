import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Core
import { XYComponentCore } from 'core/xy-component'

// Config
import { PlotbandDefaultConfig, PlotbandConfigInterface } from './config'

// Styles
import * as s from './style'

export class Plotband<Datum> extends XYComponentCore<Datum, PlotbandConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotbandDefaultConfig as PlotbandConfigInterface<Datum>
  from: number | null | undefined
  to: number | null | undefined
  plotband: Selection<SVGRectElement, any, SVGRectElement, any>

  constructor (config: PlotbandConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    this.plotband = this.g.append('rect')
      .attr('class', s.plotband)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this
    this.from = config.from
    this.to = config.to

    this.plotband
      .style('fill', config.color)

    const pos = { x: 0, y: 0, height: 0, width: 0 }

    if (config.axis === 'y') {
      pos.x = 0
      pos.y = this.yScale(this.to)
      pos.height = this.yScale(this.from) - pos.y
      pos.width = this._width
    } else {
      pos.x = this.xScale(this.from)
      pos.y = 0
      pos.height = this._height
      pos.width = this.xScale(this.to) - pos.x
    }

    smartTransition(this.plotband, 300)
      .attr('x', pos.x)
      .attr('y', pos.y)
      .attr('height', pos.height)
      .attr('width', pos.width)

    smartTransition(this.plotband.exit())
      .style('opacity', 0)
      .remove()
  }
}
