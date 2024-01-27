import { select, Selection } from 'd3-selection'

// Utils
import { merge } from 'utils/data'

// Config
import { BulletLegendDefaultConfig, BulletLegendConfigInterface } from './config'

// Local Types
import { BulletLegendItemInterface } from './types'

// Modules
import { createBullets, updateBullets } from './modules/shape'

// Styles
import * as s from './style'


export class BulletLegend {
  static selectors = s
  protected _defaultConfig = BulletLegendDefaultConfig as BulletLegendConfigInterface
  public config: BulletLegendConfigInterface = this._defaultConfig

  div: Selection<HTMLDivElement, unknown, null, undefined>
  element: HTMLElement
  prevConfig: BulletLegendConfigInterface
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
    this.config = merge(this._defaultConfig, config)
    this.render()
  }

  render (): void {
    const { config } = this

    const legendItems = this.div.selectAll<HTMLDivElement, unknown>(`.${s.item}`).data(config.items)

    const legendItemsEnter = legendItems.enter().append('div')
      .attr('class', d => `${s.item} ${d.className ?? ''}`)
      .on('click', this._onItemClick.bind(this))

    const legendItemsMerged = legendItemsEnter.merge(legendItems)
    legendItemsMerged
      .classed(s.clickable, d => !!config.onLegendItemClick && this._isItemClickable(d))
      .style('display', (d: BulletLegendItemInterface) => d.hidden ? 'none' : null)

    // Bullet
    legendItemsEnter.append('span')
      .attr('class', s.bullet)
      .call(createBullets)

    legendItemsMerged.select<SVGElement>(`.${s.bullet}`)
      .style('width', config.bulletSize)
      .style('height', config.bulletSize)
      .style('box-sizing', 'content-box')
      .call(updateBullets, this.config, this._colorAccessor)

    // Labels
    legendItemsEnter.append('span')
      .attr('class', s.label)
      .classed(config.labelClassName, true)
      .style('max-width', config.labelMaxWidth)
      .style('font-size', config.labelFontSize)

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
