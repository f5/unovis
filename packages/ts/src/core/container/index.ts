import { select, Selection } from 'd3-selection'
import { ResizeObserver } from '@juggle/resize-observer'

// Types
import { Sizing } from 'types/component'

// Utils
import { isEqual, clamp } from 'utils/data'
import { getBoundingClientRectObject } from 'utils/misc'

// Config
import { ContainerConfig, ContainerConfigInterface } from './config'

export class ContainerCore {
  svg: Selection<SVGSVGElement, unknown, null, undefined>
  element: SVGSVGElement
  prevConfig: ContainerConfig
  config: ContainerConfig

  protected _container: HTMLElement
  private _requestedAnimationFrame: number
  private _animationFramePromise: Promise<number>
  private _containerRect
  private _resizeObserver

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static DEFAULT_CONTAINER_HEIGHT = 300

  constructor (element: HTMLElement) {
    this._requestedAnimationFrame = null
    this._container = element

    // Create SVG element for visualizations
    this.svg = select(this._container).append('svg')
      // We set `display` to `block` because inline elements have an invisible
      //   inline space that adds 4px to the height of the container
      .style('display', 'block')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('height', ContainerCore.DEFAULT_CONTAINER_HEIGHT)

    this.element = this.svg.node()

    // ResizeObserver: Re-render on container resize
    this._containerRect = getBoundingClientRectObject(this._container)
    this._resizeObserver = new ResizeObserver((entries, observer) => {
      const resizedContainerRect = getBoundingClientRectObject(this._container)
      const hasSizeChanged = !isEqual(this._containerRect, resizedContainerRect)
      // do resize only if element is attached to the DOM
      // will come in useful when some ancestor of container becomes detached
      if (hasSizeChanged && resizedContainerRect.width && resizedContainerRect.height) {
        this._containerRect = resizedContainerRect
        this._onResize()
      }
    })
    this._resizeObserver.observe(this._container)
  }

  updateContainer<T extends ContainerConfigInterface> (config: T): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ConfigModel = (this.config.constructor as typeof ContainerConfig)
    this.prevConfig = this.config
    this.config = new ConfigModel().init(config)
  }

  _render (duration?: number, dontSizeToContainer?: boolean): void {
    if (!dontSizeToContainer) {
      this.svg
        .attr('width', this.config.width || this.containerWidth)
        .attr('height', this.config.height || this.containerHeight)
    }

    if (this.config.svgDefs) {
      this.svg.select('.svgDefs').remove()
      this.svg.append('defs').attr('class', 'svgDefs').html(this.config.svgDefs)
    }
  }

  render (duration = this.config.duration): Promise<number> {
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
    return clamp(this._container.clientWidth || this._container.getBoundingClientRect().width, 0, Number.POSITIVE_INFINITY)
  }

  get containerHeight (): number {
    return clamp(this._container.clientHeight || this._container.getBoundingClientRect().height, 0, Number.POSITIVE_INFINITY)
  }

  get width (): number {
    return clamp(this.containerWidth - this.config.margin.left - this.config.margin.right, 0, Number.POSITIVE_INFINITY)
  }

  get height (): number {
    return clamp(this.containerHeight - this.config.margin.top - this.config.margin.bottom, 0, Number.POSITIVE_INFINITY)
  }

  removeAllChildren (): void {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }
  }

  _onResize (): void {
    const { config } = this
    const redrawOnResize = config.sizing === Sizing.Fit || config.sizing === Sizing.FitWidth

    if (redrawOnResize) this.render(0)
  }

  destroy (): void {
    this._resizeObserver.disconnect()
    this.svg.remove()
  }
}
