// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Utils
import { getColor } from 'utils/color'

// Config
import { BulletLegendConfig, BulletLegendConfigInterface, BulletLegendItemInterface } from './config'

// Styles
import * as s from './style'

export class BulletLegend {
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  prevConfig: BulletLegendConfig
  config: BulletLegendConfig
  protected _container: HTMLElement

  private _colorAccessor = (d: BulletLegendItemInterface) => d.color

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
    const { config } = this

    const legendItems = this.div.selectAll(`.${s.item}`)
      .data(config.items) as Selection<HTMLDivElement, any, HTMLDivElement, any>

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)
      .classed('clickable', !!config.onLegendItemClick)
      .on('click', this._onItemClick.bind(this))

    legendItemsEnter.append('span')
      .attr('class', s.bullet)
      .style('width', config.bulletSize)
      .style('height', config.bulletSize)

    legendItemsEnter.append('span')
      .attr('class', s.label)
      .classed(config.labelClassName, true)
      .style('max-width', config.labelMaxWidth)
      .style('font-size', config.labelFontSize)

    const legendItemsMerged = legendItemsEnter.merge(legendItems)
    legendItemsMerged.style('display', (d: BulletLegendItemInterface) => d.hidden ? 'none' : null)
    legendItemsMerged.select(`.${s.bullet}`)
      .style('background-color', (d: BulletLegendItemInterface, i) => d.inactive ? null : getColor(d, this._colorAccessor, i))
      .style('border-color', (d: BulletLegendItemInterface, i) => getColor(d, this._colorAccessor, i))

    legendItemsMerged.select(`.${s.label}`)
      .text((d: BulletLegendItemInterface) => d.name)

    legendItems.exit().remove()
  }

  _onItemClick (d: BulletLegendItemInterface, i: number): void {
    const { config: { onLegendItemClick } } = this

    if (onLegendItemClick) onLegendItemClick(d, i)
  }
}
