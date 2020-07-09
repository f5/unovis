// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Config
import { FlowLegendConfig, FlowLegendConfigInterface } from './config'

// Styles
import * as s from './style'

enum LegendItemType {
  LABEL = 'label',
  SYMBOL = 'symbol',
}

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
    const { config: { items, lineColor, labelFontSize, labelColor, arrowSymbol, customWidth, onLegendItemClick } } = this
    if (!items.length) return

    if (customWidth) this.div.style('width', `${customWidth}px`)

    // Prepare Data
    const legendData = items.reduce((acc, label, i) => {
      acc.push({
        text: label,
        index: i,
        type: LegendItemType.LABEL,
      })

      if (arrowSymbol && acc.length !== items.length * 2 - 1) {
        acc.push({
          text: arrowSymbol,
          index: i,
          type: LegendItemType.SYMBOL,
        })
      }
      return acc
    }, [])

    // Draw
    const legendItems = this.labels.selectAll(`.${s.item}`)
      .data(legendData) as Selection<HTMLDivElement, any, HTMLDivElement, any>

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)
      .attr('opacity', 0)

    legendItemsEnter.filter(d => d.type === LegendItemType.LABEL)
      .on('click', this._onItemClick.bind(this))

    legendItemsEnter.append('span')
      .attr('class', d => d.type === LegendItemType.SYMBOL ? s.arrow({ lineColor }) : s.label({ labelFontSize, labelColor }))
      .classed(s.clickable, d => d.type === LegendItemType.LABEL && !!onLegendItemClick)

    const legendItemsMerged = legendItemsEnter.merge(legendItems)
    smartTransition(legendItemsMerged, 500)
      .attr('opacity', 1)
    legendItemsMerged.select('span').text(d => d.text)

    legendItems.exit().remove()

    this.line.attr('class', s.line({ lineColor }))
  }

  _onItemClick (d): void {
    const { config: { onLegendItemClick } } = this

    if (onLegendItemClick) onLegendItemClick(d.text, d.index)
  }
}
