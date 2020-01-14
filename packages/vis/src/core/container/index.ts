// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import ResizeObserver from 'resize-observer-polyfill'

// Utils
import { isEqual } from 'utils/data'
import { getBoundingClientRectObject } from 'utils/misc'

// Config
import { ContainerConfig, ContainerConfigInterface } from './config'

export class ContainerCore {
  svg: any
  element: HTMLElement
  prevConfig: ContainerConfig
  config: ContainerConfig

  protected _container: HTMLElement
  private _requestedAnimationFrame: number
  private _animationFramePromise: Promise<number>
  private _containerRect
  private _resizeObserver

  constructor (element: HTMLElement) {
    this._requestedAnimationFrame = null
    this._container = element
    this.svg = select(this._container).append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
    this.element = this.svg.node()

    // ResizeObserver: Re-render on container resize
    this._containerRect = getBoundingClientRectObject(this._container)
    this._resizeObserver = new ResizeObserver((entries, observer) => {
      const resizedContainerRect = getBoundingClientRectObject(this._container)
      const isSizeChanged = !isEqual(this._containerRect, resizedContainerRect)
      // do resize only if element is attached to the DOM
      // will come in useful when some ancestor of container becomes detached
      if (isSizeChanged && resizedContainerRect.width && resizedContainerRect.height) {
        this._containerRect = resizedContainerRect
        this._onResize()
      }
    })
    this._resizeObserver.observe(this._container)
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
    this.render(0)
  }

  destroy (): void {
    this._resizeObserver.disconnect()
  }
}
