import { select, Selection } from 'd3-selection'
import { ResizeObserver } from '@juggle/resize-observer'

// Types
import { Sizing } from 'types/component'

// Utils
import { isEqual, clamp } from 'utils/data'

// Config
import { ContainerConfig, ContainerConfigInterface } from './config'

export class ContainerCore {
  svg: Selection<SVGSVGElement, unknown, null, undefined>
  element: SVGSVGElement
  prevConfig: ContainerConfig
  config: ContainerConfig

  protected _container: HTMLElement
  protected _requestedAnimationFrame: number
  private _isFirstRender = true
  private _containerSize: { width: number; height: number }
  private _resizeObserver: ResizeObserver | undefined

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
  }

  updateContainer<T extends ContainerConfigInterface> (config: T): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ConfigModel = (this.config.constructor as typeof ContainerConfig)
    this.prevConfig = this.config
    this.config = new ConfigModel().init(config)
  }

  _render (duration?: number): void {
    if (this._isFirstRender) {
      this._setUpResizeObserver()
      this._isFirstRender = false
    }

    if (this.config.svgDefs) {
      this.svg.select('.svgDefs').remove()
      this.svg.append('defs').attr('class', 'svgDefs').html(this.config.svgDefs)
    }
  }

  render (duration = this.config.duration): void {
    const width = this.config.width || this.containerWidth
    const height = this.config.height || this.containerHeight

    // We set SVG size in `render()` instead of `_render()`, because the size values in pixels will become
    // available only in the next animation when being accessed via `element.clientWidth` and `element.clientHeight`,
    // and we rely on those values when setting width and size of the components.
    this.svg
      .attr('width', width)
      .attr('height', height)

    // Schedule the actual rendering in the next frame
    cancelAnimationFrame(this._requestedAnimationFrame)
    this._requestedAnimationFrame = requestAnimationFrame(() => {
      this._render(duration)
    })
  }

  get containerWidth (): number {
    return this.config.width
      ? this.element.clientWidth
      : clamp(this._container.clientWidth || this._container.getBoundingClientRect().width, 0, Number.POSITIVE_INFINITY)
  }

  get containerHeight (): number {
    return this.config.height
      ? this.element.clientHeight
      : clamp(this._container.clientHeight || this._container.getBoundingClientRect().height, 0, Number.POSITIVE_INFINITY)
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

  _setUpResizeObserver (): void {
    const containerRect = this._container.getBoundingClientRect()
    this._containerSize = { width: containerRect.width, height: containerRect.height }

    this._resizeObserver = new ResizeObserver((entries, observer) => {
      const resizedContainerRect = this._container.getBoundingClientRect()
      const resizedContainerSize = { width: resizedContainerRect.width, height: resizedContainerRect.height }
      const hasSizeChanged = !isEqual(this._containerSize, resizedContainerSize)
      // Do resize only if element is attached to the DOM
      // will come in useful when some ancestor of container becomes detached
      if (hasSizeChanged && resizedContainerSize.width && resizedContainerSize.height) {
        this._containerSize = resizedContainerSize
        this._onResize()
      }
    })
    this._resizeObserver.observe(this._container)
  }

  destroy (): void {
    cancelAnimationFrame(this._requestedAnimationFrame)
    this._resizeObserver?.disconnect()
    this.svg.remove()
  }
}
