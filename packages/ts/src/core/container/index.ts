import { select, Selection } from 'd3-selection'

// Types
import { Sizing } from 'types/component'

// Utils
import { isEqual, clamp } from 'utils/data'
import { ResizeObserver } from 'utils/resize-observer'

// Config
import { ContainerConfig, ContainerConfigInterface } from './config'

export class ContainerCore {
  svg: Selection<SVGSVGElement, unknown, null, undefined>
  element: SVGSVGElement
  prevConfig: ContainerConfig
  config: ContainerConfig

  protected _container: HTMLElement
  protected _requestedAnimationFrame: number
  protected _isFirstRender = true
  protected _resizeObserver: ResizeObserver | undefined
  private _containerSize: { width: number; height: number }

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
      .attr('height', ContainerCore.DEFAULT_CONTAINER_HEIGHT) // Overriding default SVG height of 150

    this.element = this.svg.node()
  }

  updateContainer<T extends ContainerConfigInterface> (config: T): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ConfigModel = (this.config.constructor as typeof ContainerConfig)
    this.prevConfig = this.config
    this.config = new ConfigModel().init(config)
  }

  _render (duration?: number): void {
    if (this.config.svgDefs) {
      this.svg.select('.svgDefs').remove()
      this.svg.append('defs').attr('class', 'svgDefs').html(this.config.svgDefs)
    }

    this._isFirstRender = false
  }

  // Warning: Some Containers (i.e. Single Container) may override this method, so if you introduce any changes here,
  // make sure to check that other containers didn't break after them.
  render (duration = this.config.duration): void {
    const width = this.config.width || this.containerWidth
    const height = this.config.height || this.containerHeight

    // We set SVG size in `render()` instead of `_render()`, because the size values in pixels will become
    // available only in the next animation when being accessed via `element.clientWidth` and `element.clientHeight`,
    // and we rely on those values when setting width and size of the components.
    this.svg
      .attr('width', width)
      .attr('height', height)

    // Set up Resize Observer. We do it in `render()` to capture container size change if it happened
    // in the next animation frame after the initial `render` was called.
    if (!this._resizeObserver) this._setUpResizeObserver()

    // Schedule the actual rendering in the next frame
    cancelAnimationFrame(this._requestedAnimationFrame)
    this._requestedAnimationFrame = requestAnimationFrame(() => {
      this._render(duration)
    })
  }

  get containerWidth (): number {
    return this.config.width
      ? this.element.clientWidth
      : (this._container.clientWidth || this._container.getBoundingClientRect().width)
  }

  get containerHeight (): number {
    return this.config.height
      ? this.element.clientHeight
      : (this._container.clientHeight || this._container.getBoundingClientRect().height || ContainerCore.DEFAULT_CONTAINER_HEIGHT)
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
    if (this._resizeObserver) return
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
