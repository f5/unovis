import { select, Selection } from 'd3-selection'
import { color } from 'd3-color'

// Utils
import { getColor } from 'utils/color'

// Config
import { BulletLegendConfig, BulletLegendConfigInterface } from './config'

// Local Types
import { BulletLegendItemInterface } from './types'

// Styles
import * as s from './style'

export class BulletLegend {
  static selectors = s
  div: Selection<HTMLDivElement, unknown, null, undefined>
  element: HTMLElement
  prevConfig: BulletLegendConfig
  config: BulletLegendConfig
  protected _container: HTMLElement

  private _colorAccessor = (d: BulletLegendItemInterface): string => d.color

  constructor (element: HTMLElement, config?: BulletLegendConfigInterface) {
    this._container = element

    // Create SVG element for visualizations
    this.div = select(this._container)
      .append('div')
      .attr('class', s.root)

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
    const legendItems = this.div.selectAll<HTMLDivElement, unknown>(`.${s.item}`)
      .data(config.items)

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)
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
    legendItemsMerged
      .classed(s.clickable, d => !!config.onLegendItemClick && this._isItemClickable(d))
      .style('display', (d: BulletLegendItemInterface) => d.hidden ? 'none' : null)
    const legendBulletsToUpdate = legendItemsMerged.select(`.${s.bullet}`)
    legendBulletsToUpdate.style('background-color', (d: BulletLegendItemInterface, i) => getColor(d, this._colorAccessor, i))
      .style('border-color', (d: BulletLegendItemInterface, i) => getColor(d, this._colorAccessor, i))
    legendBulletsToUpdate.each((d, i, elements) => {
      if (d.inactive) {
        const bulletColor = window.getComputedStyle(elements[i] as Element).getPropertyValue('background-color')
        const transparentColor = color(bulletColor)
        transparentColor.opacity = 0.4
        select(elements[i])
          .style('background-color', transparentColor.toString())
      }
    })

    legendItemsMerged.select(`.${s.label}`)
      .text((d: BulletLegendItemInterface) => d.name)

    legendItems.exit().remove()
  }

  _isItemClickable (item: BulletLegendItemInterface): boolean {
    return item.pointer === undefined ? true : item.pointer
  }

  _onItemClick (event: MouseEvent, d: BulletLegendItemInterface): void {
    const { config: { onLegendItemClick } } = this

    const legendItems = this.div.selectAll(`.${s.item}`).nodes() as HTMLElement[]
    const index = legendItems.indexOf(event.currentTarget as HTMLElement)
    if (onLegendItemClick) onLegendItemClick(d, index)
  }

  public destroy (): void {
    this.div.remove()
  }
}
