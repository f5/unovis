// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Config
import { ContainerConfig, ContainerConfigInterface } from './config'

// Utils
// import { getScale } from 'utils/scale'

export class ContainerCore {
  svg: any
  element: HTMLElement
  prevConfig: ContainerConfig
  config: ContainerConfig

  protected _container: HTMLElement
  private _requestedAnimationFrame: number
  private _animationFramePromise: Promise<number>

  constructor (element: HTMLElement) {
    this._requestedAnimationFrame = null
    this._container = element
    this.svg = select(this._container).append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
    this.element = this.svg.node()
  }

  updateContainer<T extends ContainerConfigInterface> (config: T): void {
    const ConfigModel = (this.config.constructor as typeof ContainerConfig)
    this.prevConfig = this.config
    this.config = new ConfigModel().init(config)
  }

  // setData (...data) {
  //   if (data.length === 1) {
  //     for (const c of this._components) {
  //       c.setData(data[0])
  //     }
  //   }
  // }

  _render (duration?): void {
    this.svg
      .attr('width', this.containerWidth)
      .attr('height', this.containerHeight)
  }

  render (duration?): Promise<number> {
    window.cancelAnimationFrame(this._requestedAnimationFrame)

    this._animationFramePromise = new Promise((resolve, reject) => {
      this._requestedAnimationFrame = window.requestAnimationFrame(() => {
        this._render(duration)
        resolve(this._requestedAnimationFrame)
      })
    })

    return this._animationFramePromise
  }

  get containerWidth (): number {
    return this._container.clientWidth || this._container.getBoundingClientRect().width
  }

  get containerHeight (): number {
    return this._container.clientHeight || this._container.getBoundingClientRect().height
  }

  get width (): number {
    return this.containerWidth - this.config.margin.left - this.config.margin.right
  }

  get height (): number {
    return this.containerHeight - this.config.margin.top - this.config.margin.bottom
  }

  removeAllChildren (): void {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }
  }

  _onResize (): void {
    this.render()
  }
}
