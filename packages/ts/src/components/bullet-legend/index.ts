import { select, Selection } from 'd3-selection'
import toPx from 'to-px'

// Utils
import { merge } from 'utils/data'

// Config
import { BulletLegendDefaultConfig, BulletLegendConfigInterface } from './config'

// Local Types
import { BulletLegendItemInterface, BulletLegendOrientation } from './types'

// Modules
import { createBullets, updateBullets, getBulletsTotalWidth } from './modules/shape'

// Styles
import * as s from './style'

export class BulletLegend {
  static selectors = s
  protected _defaultConfig = BulletLegendDefaultConfig as BulletLegendConfigInterface
  public config: BulletLegendConfigInterface = this._defaultConfig

  div: Selection<HTMLElement, unknown, null, undefined>
  element: HTMLElement
  prevConfig: BulletLegendConfigInterface
  protected _container: HTMLElement

  private _colorAccessor = (d: BulletLegendItemInterface): string|string[] => d.color

  constructor (element: HTMLElement, config?: BulletLegendConfigInterface) {
    this._container = element

    this.div = config?.renderIntoProvidedDomNode ? select(this._container) : select(this._container).append<HTMLElement>('div')
    this.div.classed(s.root, true)

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
      .on('click', this._onItemClick.bind(this))

    const legendItemsMerged = legendItemsEnter.merge(legendItems)
    legendItemsMerged
      .attr('class', d => `${s.item} ${d.className ?? ''}`)
      .classed(s.itemVertical, config.orientation === BulletLegendOrientation.Vertical)
      .classed(s.clickable, d => !!config.onLegendItemClick && this._isItemClickable(d))
      .attr('title', d => d.name)
      .style('display', (d: BulletLegendItemInterface) => d.hidden ? 'none' : null)

    // Bullet
    legendItemsEnter.append('span')
      .attr('class', s.bullet)
      .call(createBullets)

    legendItemsMerged.select<SVGElement>(`.${s.bullet}`)
      .style('width', function (d: BulletLegendItemInterface) {
        const colors = Array.isArray(d.color) ? d.color : [d.color]
        const numColors = colors.length
        const defaultSize = toPx(getComputedStyle(this).getPropertyValue('--vis-legend-bullet-size')) || 9
        const baseSize = config.bulletSize ? toPx(config.bulletSize) : defaultSize
        const spacing = config.bulletSpacing
        return `${getBulletsTotalWidth(baseSize, numColors, spacing)}px`
      })
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
    if (this.element !== this._container) this.div.remove()
  }
}
