import { select, Selection } from 'd3-selection'

// Utils
import { smartTransition } from 'utils/d3'

// Config
import { FlowLegendConfig, FlowLegendConfigInterface } from './config'

// Local Types
import { FlowLegendItem, FlowLegendItemType } from './types'

// Styles
import * as s from './style'

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

    this.div = select(this._container).append('div').attr('class', s.root)
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
    const { config: { items, lineColor, labelFontSize, labelColor, arrowSymbol, arrowColor, customWidth, onLegendItemClick } } = this
    if (!items.length) return

    if (customWidth) this.div.style('width', `${customWidth}px`)

    // Prepare Data
    const legendData: FlowLegendItem[] = items.reduce((acc, label, i) => {
      acc.push({
        text: label,
        index: i,
        type: FlowLegendItemType.Label,
      })

      if (arrowSymbol && (acc.length !== items.length * 2 - 1)) {
        acc.push({
          text: arrowSymbol,
          index: i,
          type: FlowLegendItemType.Symbol,
        })
      }
      return acc
    }, [])

    // Draw
    const legendItems = this.labels.selectAll(`.${s.item}`)
      .data(legendData) as Selection<HTMLDivElement, FlowLegendItem, HTMLDivElement, FlowLegendItem>

    const legendItemsEnter = legendItems.enter()
      .append('div')
      .attr('class', s.item)
      .attr('opacity', 0)

    legendItemsEnter.filter(d => d.type === FlowLegendItemType.Label)
      .on('click', this._onItemClick.bind(this))

    legendItemsEnter.append('span')
      .attr('class', d => d.type === FlowLegendItemType.Symbol ? s.arrow(arrowColor) : s.label(labelFontSize, labelColor))
      .classed(s.clickable, d => d.type === FlowLegendItemType.Label && !!onLegendItemClick)

    const legendItemsMerged = legendItemsEnter.merge(legendItems)
    smartTransition(legendItemsMerged, 500)
      .attr('opacity', 1)
    legendItemsMerged.select('span').text(d => d.text)

    legendItems.exit().remove()

    this.line
      .attr('class', s.line(lineColor))
      .style('opacity', items.length > 1 ? 1 : 0)
  }

  _onItemClick (event: MouseEvent, d: FlowLegendItem): void {
    const { config: { onLegendItemClick } } = this

    if (onLegendItemClick) onLegendItemClick(d.text, d.index)
  }
}
