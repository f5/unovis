import { select, Selection } from 'd3-selection'
// Adds `.interrupt()` to `Selection`, used in `destroy()`
import 'd3-transition'

// Core
import { ComponentCore } from '@/core/component'

// Types
import { Sizing } from '@/types/component'
import { Spacing } from '@/types/spacing'

// Utils
import { isEqual, clamp, merge } from '@/utils/data'
import { getPixelValue } from '@/utils/misc'
import { ResizeObserver } from '@/utils/resize-observer'

// Config
import { ContainerDefaultConfig, ContainerConfigInterface } from './config'

// Render Scheduler
import { cancelContainerRender, scheduleContainerRender } from './render-scheduler'

export class ContainerCore {
  public svg: Selection<SVGSVGElement, unknown, null, undefined>
  public element: SVGSVGElement
  public prevConfig: ContainerConfigInterface
  public config: ContainerConfigInterface

  protected _defaultConfig: ContainerConfigInterface = ContainerDefaultConfig
  protected _container: HTMLElement
  protected _isFirstRender = true
  protected _isFirstResize = true
  protected _resizeObserver: ResizeObserver | undefined
  protected _resizeObserverAnimationFrameId: number
  protected _resizeDebounceTimeoutId: ReturnType<typeof setTimeout> | undefined
  protected _svgDefs: Selection<SVGDefsElement, unknown, null, undefined>
  protected _svgDefsExternal: Selection<SVGDefsElement, unknown, null, undefined>
  private _containerSize: { width: number; height: number }
  protected _pendingRenderDuration: number | undefined

  // An arrow function so the task identity stays stable, which is what lets the scheduler de-duplicate
  protected _renderTask = (): void => {
    this._preRender()
    this._render(this._pendingRenderDuration)
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static DEFAULT_CONTAINER_HEIGHT = 300

  constructor (element: HTMLElement) {
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

    // Add `svgDefs` if provided in the config
    if (config?.svgDefs !== this.prevConfig?.svgDefs) {
      this._svgDefsExternal.selectAll('*').remove()
      this._svgDefsExternal.html(config.svgDefs)
    }
  }

  // The `_preRender` step should be used to perform some actions before rendering.
  // For example, calculating scales, setting component sizes, etc ...
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _preRender (): void {}

  /** Propagates the container's size, margin, and color function to the provided components.
   * Containers call this during `_preRender` */
  protected _propagateSizeAndStyleToComponents (components: (ComponentCore<unknown> | undefined)[], margin: Spacing): void {
    for (const c of components) {
      if (!c) continue
      c.setSize(this.width, this.height, this.containerWidth, this.containerHeight)
      c.setContainerMargin(margin)
      c.setColorFunction(this.config.colorFunction)
    }
  }

  // The `_render` step should be used to perform the actual rendering
  protected _render (duration?: number): void {
    const { config } = this

    // Apply the `aria-label` attribute
    select(this._container)
      .attr('aria-label', config.ariaLabel)

    this._isFirstRender = false
  }

  // Warning: Some Containers (i.e. Single Container) may override this method, so if you introduce any changes here,
  // make sure to check that other containers didn't break after them.
  public render (duration = this.config.duration): void {
    // We set SVG size in `render()` instead of `_render()`, because the size values in pixels will become
    // available only in the next animation when being accessed via `element.clientWidth` and `element.clientHeight`,
    // and we rely on those values when setting width and size of the components.
    this._updateSvgSize()

    // Set up Resize Observer. We do it in `render()` to capture container size change if it happened
    // in the next animation frame after the initial `render` was called.
    if (!this._resizeObserver) this._setUpResizeObserver()

    // Schedule the actual rendering in one of the next frames
    this._pendingRenderDuration = duration
    scheduleContainerRender(this._renderTask)
  }

  get containerWidth (): number {
    // Falling back to the configured value when `clientWidth` is 0 (e.g. detached
    // containers or non-layouting environments like jsdom / SSR)
    return this.config.width
      ? (this.element.clientWidth || getPixelValue(this.config.width) || 0)
      : (this._container.clientWidth || this._container.getBoundingClientRect().width)
  }

  get containerHeight (): number {
    return this.config.height
      ? (this.element.clientHeight || getPixelValue(this.config.height) || 0)
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

  /** Reconciles the direct children of the container's SVG element with the provided list:
   * only inserts / moves elements that are missing or out of order and removes the ones
   * that are no longer present. Unlike a full detach + re-append, this doesn't interrupt
   * CSS transitions or reset the internal state of unaffected elements */
  protected _reconcileChildren (desiredChildren: (Element | null | undefined)[]): void {
    const desired = desiredChildren.filter(Boolean)
    const desiredSet = new Set(desired)

    // Remove the children that are no longer present
    let child = this.element.firstChild
    while (child) {
      const next = child.nextSibling
      if (!desiredSet.has(child as Element)) this.element.removeChild(child)
      child = next
    }

    // Insert or move elements only when their current position doesn't match the desired one
    let cursor = this.element.firstChild
    for (const el of desired) {
      if (el === cursor) {
        cursor = cursor.nextSibling
      } else {
        this.element.insertBefore(el, cursor)
      }
    }
  }

  /** Kept out of `render()` so it can also be applied when redraws are suppressed */
  protected _updateSvgSize (): void {
    this.svg
      .attr('width', this.config.width || this.containerWidth)
      .attr('height', this.config.height || this.containerHeight)
  }

  protected _onResize (): void {
    const { config } = this
    const sizingAllowsRedraw = config.sizing === Sizing.Fit || config.sizing === Sizing.FitWidth
    if (!sizingAllowsRedraw) return

    // Wrappers can spread these through as `undefined`, which `merge` copies over the default (#929)
    const redrawOnResize = config.redrawOnResize ?? ContainerDefaultConfig.redrawOnResize
    const resizeDebounce = config.resizeDebounce ?? ContainerDefaultConfig.resizeDebounce

    // Resize the box now so the chart doesn't overflow its parent while the redraw is delayed
    if (config.sizing === Sizing.Fit) this._updateSvgSize()

    if (!redrawOnResize) return

    clearTimeout(this._resizeDebounceTimeoutId)

    // The first size change is usually the layout settling after mount, so it shouldn't wait out the debounce
    if (!resizeDebounce || this._isFirstResize) {
      this._isFirstResize = false
      this.render(0)
      return
    }

    this._resizeDebounceTimeoutId = setTimeout(() => this.render(0), resizeDebounce)
  }

  /** Rounded to whole pixels: sub-pixel jitter renders identically, so it shouldn't redraw */
  private _getRoundedContainerRectSize (): { width: number; height: number } {
    const rect = this._container.getBoundingClientRect()
    return { width: Math.round(rect.width), height: Math.round(rect.height) }
  }

  protected _setUpResizeObserver (): void {
    if (this._resizeObserver) return

    this._containerSize = this._getRoundedContainerRectSize()

    this._resizeObserver = new ResizeObserver((entries, observer) => {
      // Using request animation frame to avoid multiple resize events when scrollbars appear/disappear
      // See more: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#observation_errors
      cancelAnimationFrame(this._resizeObserverAnimationFrameId)
      this._resizeObserverAnimationFrameId = requestAnimationFrame(() => {
        const resizedContainerSize = this._getRoundedContainerRectSize()
        const hasSizeChanged = !isEqual(this._containerSize, resizedContainerSize)
        // Do resize only if element is attached to the DOM
        // will come in useful when some ancestor of container becomes detached
        if (hasSizeChanged && resizedContainerSize.width && resizedContainerSize.height) {
          this._containerSize = resizedContainerSize
          this._onResize()
        }
      })
    })
    this._resizeObserver.observe(this._container)
  }

  public destroy (): void {
    cancelContainerRender(this._renderTask)
    cancelAnimationFrame(this._resizeObserverAnimationFrameId)
    clearTimeout(this._resizeDebounceTimeoutId)
    this._resizeObserver?.disconnect()
    // d3 transitions run on `d3-timer` and keep tweening against the detached SVG unless interrupted
    this.svg.interrupt().selectAll('*').interrupt()
    this.svg.remove()
  }
}
