import { select, Selection } from 'd3-selection'

// Utils
import { smartTransition } from '@/utils/d3'
import { merge } from '@/utils/data'

// Config
import { FlowLegendDefaultConfig, FlowLegendConfigInterface } from './config'

// Local Types
import { FlowLegendItem, FlowLegendItemType } from './types'

// Styles
import * as s from './style'

export class FlowLegend {
  static selectors = s
  div: Selection<HTMLElement, unknown, null, undefined>
  element: HTMLElement
  labels: Selection<HTMLDivElement, unknown, null, undefined>
  protected _defaultConfig = FlowLegendDefaultConfig as FlowLegendConfigInterface
  public config: FlowLegendConfigInterface = this._defaultConfig
  prevConfig: FlowLegendConfigInterface
  protected _container: HTMLElement

  constructor (element: HTMLElement, config?: FlowLegendConfigInterface) {
    this._container = element

    this.div = config?.renderIntoProvidedDomNode
      ? select(this._container)
      : select(this._container).append<HTMLElement>('div')
    this.div.classed(s.root, true)

    this.element = this.div.node()

    this.labels = this.div.append('div')

    if (config) this.setConfig(config)
  }

  setConfig (config: FlowLegendConfigInterface): void {
    this.prevConfig = this.config
    this.config = merge(this._defaultConfig, config)
    this.render()
  }

  /** @deprecated Use setConfig instead */
  update (config: FlowLegendConfigInterface): void {
    this.setConfig(config)
  }

  render (): void {
    const { config } = this
    if (!config.items.length) return

    if (config.customWidth) this.div.style('width', `${config.customWidth}px`)

    // Prepare Data
    const legendData: FlowLegendItem[] = config.items.reduce((acc, label, i) => {
      acc.push({
        text: label,
        index: i,
        type: FlowLegendItemType.Label,
      })

      if (config.arrowSymbol && (acc.length !== config.items.length * 2 - 1)) {
        acc.push({
          text: config.arrowSymbol,
          index: i,
          type: FlowLegendItemType.Symbol,
        })
      }
      return acc
    }, [])

    // Draw
    this.div
      .style('margin-left', config.margin?.left ? `${config.margin.left}px` : null)
      .style('margin-right', config.margin?.right ? `${config.margin.right}px` : null)
      .style('margin-top', config.margin?.top ? `${config.margin.top}px` : null)
      .style('margin-bottom', config.margin?.bottom ? `${config.margin.bottom}px` : null)

    this.labels.attr('class', s.labels(config.spacing, config.lineColor, legendData))

    const legendItems = this.labels.selectAll<HTMLDivElement, FlowLegendItem>(`.${s.item}`)
      .data(legendData)

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)
      .attr('opacity', 0)

    legendItemsEnter.filter(d => d.type === FlowLegendItemType.Label)
      .on('click', this._onItemClick.bind(this))

    legendItemsEnter.append('span')

    const legendItemsMerged = legendItemsEnter.merge(legendItems)
    smartTransition(legendItemsMerged, 500)
      .attr('opacity', 1)

    legendItemsMerged.select('span')
      .attr('class',
        d => d.type === FlowLegendItemType.Symbol
          ? s.arrow(config.arrowColor, config.arrowSymbolYOffset)
          : s.label(config.labelFontSize, config.labelColor)
      )
      .classed(s.clickable, d => d.type === FlowLegendItemType.Label && !!config.onLegendItemClick)
      .html(d => d.text)

    legendItems.exit().remove()
  }

  _onItemClick (event: MouseEvent, d: FlowLegendItem): void {
    const { config } = this

    if (config.onLegendItemClick) config.onLegendItemClick(d.text, d.index)
  }

  public destroy (): void {
    this.labels.remove()
    if (this.element !== this._container) this.div.remove()
  }
}
