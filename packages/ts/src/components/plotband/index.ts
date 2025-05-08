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

    smartTransition(this.plotband.exit())
      .style('opacity', 0)
      .remove()
  }
}
