// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Config
import { FlowLegendConfig, FlowLegendConfigInterface } from './config'

// Styles
import * as s from './style'

export class FlowLegend {
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  line: Selection<HTMLElement, any, HTMLElement, any>
  labels: Selection<HTMLElement, any, HTMLElement, any>
  prevConfig: FlowLegendConfig
  config: FlowLegendConfig
  protected _container: HTMLElement

  constructor (element: HTMLElement, config?: FlowLegendConfigInterface) {
    this._container = element

    this.div = select(this._container).append('div').attr('class', s.container)
    this.element = this.div.node()

    this.line = this.div.append('div')
    this.labels = this.div.append('div').attr('class', s.labels)

    if (config) this.update(config)
  }

  update (config: FlowLegendConfigInterface): void {
    this.prevConfig = this.config
    this.config = new FlowLegendConfig().init(config)
    this.render()
  }

  render (): void {
    const { config: { items, lineColor, labelFontSize, labelColor, arrowSymbol } } = this
    if (!items.length) return

    this.line.attr('class', s.line({ lineColor }))

    const legendData = items.reduce((acc, curr) => {
      acc.push(curr)
      if (arrowSymbol && acc.length !== items.length * 2 - 1) acc.push(arrowSymbol)
      return acc
    }, [])

    const legendItems = this.labels.selectAll(`.${s.item}`)
      .data(legendData) as Selection<HTMLDivElement, any, HTMLDivElement, any>

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)

    legendItemsEnter.append('span')
      .attr('class', (d, i) => arrowSymbol && i % 2 ? s.arrow({ lineColor }) : s.label({ labelFontSize, labelColor }))

    const legendItemsMerged = legendItemsEnter.merge(legendItems)

    legendItemsMerged.select('span').text(d => d)

    legendItems.exit().remove()
  }
}
