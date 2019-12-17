// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, mouse } from 'd3-selection'

// Config
import { TooltipConfig, TooltipConfigInterface } from './config'

// Style
import * as s from './style'

export class Tooltip {
  element: HTMLElement
  div: Selection<HTMLElement, any, any, any>
  config: TooltipConfig
  prevConfig: TooltipConfig
  component: any

  private _container: HTMLElement

  constructor (config?: TooltipConfigInterface, containerElement?: HTMLElement) {
    this._container = containerElement
    this.config = new TooltipConfig().init(config)

    this.component = this.config.component

    this.element = document.createElement('div')
    this.div = select(this.element)
      .attr('class', s.tooltip)
  }

  setContainer (container) {
    this._container?.removeChild(this.element)

    this._container = container
    this._container.appendChild(this.element)
  }

  setComponent (component) {
    this.component = component
  }

  update () {
    if (!this._container) return

    Object.keys(this.config.elements).forEach(className => {
      const template = this.config.elements[className]
      this.component.g.selectAll(`.${className}`)
        .on('mousemove.tooltip', (d, i, elements) => {
          const [x, y] = mouse(this._container)
          this.show(template(d, i, elements), {x, y})
        })
        .on('mouseleave.tooltip', (d, i, elements) => this.hide())
    })
  }

  show (html: string, pos: { x: number; y: number}): void {
    this.div.classed('show', true)
      .html(html)

    this.place(pos)
  }
  
  hide (): void {
    this.div.classed('show', false)
  }

  place (pos): void {
    const width = this.element.offsetWidth
    // const height = this.element.offsetHeight
    const containerHeight = this._container.offsetHeight

    this.div
      .style('bottom', `${containerHeight - pos.y}px`)
      .style('left', `${pos.x - width / 2}px`)
  }
  
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  render (customDuration?: number): void {
  }
}
