import { select, Selection } from 'd3-selection'

// Utils
import { merge } from 'utils/data'

// Config
import { RollingPinLegendConfigInterface, RollingPinLegendDefaultConfig } from './config'

// Styles
import * as s from './style'

export class RollingPinLegend {
  static selectors = s
  protected _defaultConfig = RollingPinLegendDefaultConfig as RollingPinLegendConfigInterface
  public config: RollingPinLegendConfigInterface = this._defaultConfig

  div: Selection<HTMLElement, unknown, null, undefined>
  element: HTMLElement
  prevConfig: RollingPinLegendConfigInterface
  protected _container: HTMLElement

  constructor (element: HTMLElement, config?: RollingPinLegendConfigInterface) {
    this._container = element

    this.div = config?.renderIntoProvidedDomNode ? select(this._container) : select(this._container).append<HTMLElement>('div')
    this.div.classed(s.root, true)

    this.element = this.div.node()

    if (config) this.setConfig(config)
  }

  setConfig (config: RollingPinLegendConfigInterface): void {
    this.prevConfig = this.config
    this.config = merge(this._defaultConfig, config)
    this.render()
  }

  render (): void {
    const { config } = this

    const newRoot = this.div
      .selectAll<HTMLDivElement, unknown>(`.${s.root}`)
      .data([0])
      .enter()
      .append('div')
      .attr('class', s.root)

    newRoot
      .append('span')
      .attr('class', s.label)
      .classed(config.labelClassName, true)
      .style('font-size', config.labelFontSize)

    newRoot
      .append('div')
      .attr('class', s.rectsContainer)

    newRoot
      .append('span')
      .attr('class', s.label)
      .classed(config.labelClassName, true)
      .style('font-size', config.labelFontSize)

    const root = this.div
      .select<HTMLDivElement>(`.${s.root}`)

    root.selectAll<HTMLDivElement, unknown>(`.${s.label}`)
      .data([config.leftLabelText, config.rightLabelText])
      .text(d => d)
      .classed(s.leftLabel, (d, i) => i === 0 && typeof d === 'string' && d.length > 0)
      .classed(s.rightLabel, (d, i) => i === 1 && typeof d === 'string' && d.length > 0)

    const rectsContainer = root.select<HTMLDivElement>(`.${s.rectsContainer}`)

    const rects = rectsContainer.selectAll<HTMLDivElement, unknown>(`.${s.rect}`).data(config.rects)

    const rectsEnter = rects.enter()
      .append('div')
      .attr('class', s.rect)

    const rectsMerged = rectsEnter.merge(rects)
    rectsMerged
      .style('background-color', d => d)

    rects.exit().remove()
  }

  public destroy (): void {
    if (this.element !== this._container) this.div.remove()
  }
}
