// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Utils
import { getColor } from 'utils/color'

// Config
import { BulletLegendConfig, BulletLegendConfigInterface } from './config'

// Styles
import * as s from './style'

export class BulletLegend {
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  prevConfig: BulletLegendConfig
  config: BulletLegendConfig
  protected _container: HTMLElement

  private _colorAccessor = d => d.color

  constructor (element: HTMLElement, config?: BulletLegendConfigInterface) {
    this._container = element

    // Create SVG element for visualizations
    this.div = select(this._container).append('div')
    this.element = this.div.node()

    if (config) this.update(config)
  }

  update (config: BulletLegendConfigInterface): void {
    this.prevConfig = this.config
    this.config = new BulletLegendConfig().init(config)
    this.render()
  }

  render (): void {
    const { config: { items, labelClassName, onLegendItemClick } } = this

    const legendItems = this.div.selectAll(`.${s.item}`)
      .data(items) as Selection<HTMLDivElement, any, HTMLDivElement, any>

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)
      .classed('clickable', !!onLegendItemClick)
      .on('click', this._onItemClick.bind(this))

    legendItemsEnter.append('span')
      .attr('class', s.bullet)

    legendItemsEnter.append('span')
      .attr('class', s.label)
      .classed(labelClassName, true)

    const legendItemsMerged = legendItemsEnter.merge(legendItems)

    legendItemsMerged.select(`.${s.bullet}`)
      .style('background-color', (d, i) => d.inactive ? null : getColor(d, this._colorAccessor, i))
      .style('border-color', (d, i) => getColor(d, this._colorAccessor, i))

    legendItemsMerged.select(`.${s.label}`)
      .text(d => d.name)

    legendItems.exit().remove()
  }

  _onItemClick (d: any, i: number): void {
    const { config: { onLegendItemClick } } = this

    if (onLegendItemClick) onLegendItemClick(d, i)
  }
}
