import { Selection, select } from 'd3-selection'

// Local Types
import { VisControlItemInterface, VisControlsOrientation } from './types'

// Config
import { VisControlsConfig, VisControlsConfigInterface } from './config'

// Style
import * as s from './style'

export class VisControls {
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  config: VisControlsConfig
  protected _container: HTMLElement
  protected _items: Selection<HTMLElement, any, HTMLElement, any>

  constructor (element: HTMLElement, config?: VisControlsConfigInterface) {
    this._container = element

    this.div = select(this._container)
      .append('div')
      .attr('class', s.root)
    this.element = this.div.node()
    this._items = this.div.append('div')
      .attr('class', s.items)

    if (config) this.update(config)
  }

  update (config: VisControlsConfigInterface): void {
    this.config = new VisControlsConfig().init(config)
    this.render()
  }

  render (): void {
    const { config: { items, orientation } } = this
    this._items
      .classed(s.horizontalItems, orientation === VisControlsOrientation.Horizontal)
    const controlItems = this._items.selectAll(`.${s.item}`)
      .data(items) as Selection<HTMLDivElement, any, HTMLDivElement, any>

    const controlItemsEnter = controlItems.enter()
      .append('div')
      .attr('class', s.item)
      .on('click', this._onItemClick.bind(this))

    controlItemsEnter.append('button')
      .attr('class', s.itemButton)

    const controlItemsMerged = controlItemsEnter.merge(controlItems)
    controlItemsMerged
      .classed(s.borderLeft, d => d.borderLeft)
      .classed(s.borderTop, d => d.borderTop)
      .classed(s.borderRight, d => d.borderRight)
      .classed(s.borderBottom, d => d.borderBottom)
      .classed(s.disabled, d => d.disabled)
    controlItemsMerged.select(`.${s.itemButton}`)
      .html(item => item.icon)

    controlItems.exit().remove()
  }

  _onItemClick (event: MouseEvent, item: VisControlItemInterface): void {
    item.callback?.(event)
  }
}
