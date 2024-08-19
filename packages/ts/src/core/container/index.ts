import { select, Selection } from 'd3-selection'

// Types
import { Sizing } from 'types/component'

// Utils
import { isEqual, clamp, merge } from 'utils/data'
import { ResizeObserver } from 'utils/resize-observer'

// Config
import { ContainerDefaultConfig, ContainerConfigInterface } from './config'

export class ContainerCore {
  public svg: Selection<SVGSVGElement, unknown, null, undefined>
  public element: SVGSVGElement
  public prevConfig: ContainerConfigInterface
  public config: ContainerConfigInterface

  protected _defaultConfig: ContainerConfigInterface = ContainerDefaultConfig
  protected _container: HTMLElement
  protected _requestedAnimationFrame: number
  protected _isFirstRender = true
  protected _resizeObserver: ResizeObserver | undefined
  protected _svgDefs: Selection<SVGDefsElement, unknown, null, undefined>
  protected _svgDefsExternal: Selection<SVGDefsElement, unknown, null, undefined>
  private _containerSize: { width: number; height: number }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static DEFAULT_CONTAINER_HEIGHT = 300

  constructor (element: HTMLElement) {
    this._requestedAnimationFrame = null
    this._container = element

    // Setting `role` attribute to `image` to make the container accessible
    const container = select(this._container)
    container.attr('role', 'figure')

    // Create SVG element for visualizations
    this.svg = container.append('svg')
      // We set `display` to `block` because inline elements have an invisible
      //   inline space that adds 4px to the height of the container
      .style('display', 'block')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('height', ContainerCore.DEFAULT_CONTAINER_HEIGHT) // Overriding default SVG height of 150
      .attr('aria-hidden', true)

    this._svgDefs = this.svg.append('defs')
    this._svgDefsExternal = this.svg.append('defs')
    this.element = this.svg.node()
  }

  public updateContainer<T extends ContainerConfigInterface> (config: T): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.prevConfig = this.config
    this.config = merge(this._defaultConfig, config)
  }

  // The `_preRender` step should be used to perform some actions before rendering.
  // For example, calculating scales, setting component sizes, etc ...
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _preRender (): void {}

  // The `_render` step should be used to perform the actual rendering
  protected _render (duration?: number): void {
    const { config, prevConfig } = this

    // Add `svgDefs` if provided in the config
    if (config.svgDefs !== prevConfig?.svgDefs) {
      this._svgDefsExternal.selectAll('*').remove()
      this._svgDefsExternal.html(config.svgDefs)
    }

    // Apply the `aria-label` attribute
    select(this._container)
      .attr('aria-label', config.ariaLabel)

    this._isFirstRender = false
  }

  // Warning: Some Containers (i.e. Single Container) may override this method, so if you introduce any changes here,
  // make sure to check that other containers didn't break after them.
  public render (duration = this.config.duration): void {
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
      this._preRender()
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

  protected _removeAllChildren (): void {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }
  }

  protected _onResize (): void {
    const { config } = this
    const redrawOnResize = config.sizing === Sizing.Fit || config.sizing === Sizing.FitWidth
    if (redrawOnResize) this.render(0)
  }

  protected _setUpResizeObserver (): void {
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

  public destroy (): void {
    cancelAnimationFrame(this._requestedAnimationFrame)
    this._resizeObserver?.disconnect()
    this.svg.remove()
  }
}
