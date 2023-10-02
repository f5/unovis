import { select, Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'
import { merge } from 'utils/data'

// Config
import { FlowLegendDefaultConfig, FlowLegendConfigInterface } from './config'

// Local Types
import { FlowLegendItem, FlowLegendItemType } from './types'

// Styles
import * as s from './style'

export class FlowLegend {
  div: Selection<HTMLDivElement, unknown, null, undefined>
  element: HTMLElement
  line: Selection<HTMLDivElement, unknown, null, undefined>
  labels: Selection<HTMLDivElement, unknown, null, undefined>
  protected _defaultConfig = FlowLegendDefaultConfig as FlowLegendConfigInterface
  public config: FlowLegendConfigInterface = this._defaultConfig
  prevConfig: FlowLegendConfigInterface
  protected _container: HTMLElement

  constructor (element: HTMLElement, config?: FlowLegendConfigInterface) {
    this._container = element

    this.div = select(this._container).append('div').attr('class', s.root)
    this.element = this.div.node()

    this.line = this.div.append('div')
    this.labels = this.div.append('div').attr('class', s.labels)

    if (config) this.update(config)
  }

  update (config: FlowLegendConfigInterface): void {
    this.prevConfig = this.config
    this.config = merge(this._defaultConfig, config)
    this.render()
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
    const legendItems = this.labels.selectAll<HTMLDivElement, FlowLegendItem>(`.${s.item}`)
      .data(legendData)

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)
      .attr('opacity', 0)

    legendItemsEnter.filter(d => d.type === FlowLegendItemType.Label)
      .on('click', this._onItemClick.bind(this))

    legendItemsEnter.append('span')
      .attr('class',
        d => d.type === FlowLegendItemType.Symbol
          ? s.arrow(config.arrowColor)
          : s.label(config.labelFontSize, config.labelColor)
      )
      .classed(s.clickable, d => d.type === FlowLegendItemType.Label && !!config.onLegendItemClick)

    const legendItemsMerged = legendItemsEnter.merge(legendItems)
    smartTransition(legendItemsMerged, 500)
      .attr('opacity', 1)
    legendItemsMerged.select('span').html(d => d.text)

    legendItems.exit().remove()

    this.line
      .attr('class', s.line(config.lineColor))
      .style('opacity', config.items.length > 1 ? 1 : 0)
  }

  _onItemClick (event: MouseEvent, d: FlowLegendItem): void {
    const { config } = this

    if (config.onLegendItemClick) config.onLegendItemClick(d.text, d.index)
  }
}
