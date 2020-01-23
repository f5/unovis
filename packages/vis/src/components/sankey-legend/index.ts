// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Config
import { SankeyLegendConfig, SankeyLegendConfigInterface } from './config'

// Styles
import * as s from './style'

export class SankeyLegend {
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  line: Selection<HTMLElement, any, HTMLElement, any>
  items: Selection<HTMLElement, any, HTMLElement, any>
  prevConfig: SankeyLegendConfig
  config: SankeyLegendConfig
  protected _container: HTMLElement

  constructor (element: HTMLElement, config?: SankeyLegendConfigInterface) {
    this._container = element

    this.div = select(this._container).append('div').attr('class', s.container)
    this.element = this.div.node()

    this.line = this.div.append('div').attr('class', s.line)
    this.items = this.div.append('div').attr('class', s.items)

    if (config) this.update(config)
  }

  update (config: SankeyLegendConfigInterface): void {
    this.prevConfig = this.config
    this.config = new SankeyLegendConfig().init(config)
    this.render()
  }

  render (): void {
    const { config: { items, margin } } = this
    if (!items.length) return

    this.div
      .style('margin-left', `${margin.left}px`)
      .style('margin-right', `${margin.right}px`)

    const legendItemsData = items.reduce((acc, curr) => {
      acc.push(curr)
      if (acc.length !== items.length * 2 - 1) acc.push('▶')
      return acc
    }, [])

    const legendItems = this.items.selectAll(`.${s.item}`)
      .data(legendItemsData) as Selection<HTMLDivElement, any, HTMLDivElement, any>

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)

    legendItemsEnter.append('span')
      .attr('class', (d, i) => i % 2 ? s.arrow : s.label)

    const legendItemsMerged = legendItemsEnter.merge(legendItems)

    legendItemsMerged.select('span').text(d => d)

    legendItems.exit().remove()
  }
}
