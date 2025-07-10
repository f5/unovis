import { select, Selection, ValueFn } from 'd3-selection'
import { Transition } from 'd3-transition'

// Core
import { CoreDataModel } from 'data-models/core'

// Utils
import { merge, throttle } from 'utils/data'
import { guid } from 'utils/misc'

// Types
import { ComponentType, Sizing } from 'types/component'
import { Spacing } from 'types/spacing'

// Local Types
import { VisEventCallback, VisEventType } from './types'

// Config
import { ComponentDefaultConfig, ComponentConfigInterface } from './config'

export class ComponentCore<
  CoreDatum,
  ConfigInterface extends ComponentConfigInterface = ComponentConfigInterface,
> {
  public element: SVGGElement | HTMLElement
  public type: ComponentType = ComponentType.SVG
  public g: Selection<SVGGElement, unknown, null, undefined> | Selection<HTMLElement, unknown, null, undefined>
  public config: ConfigInterface
  public prevConfig: ConfigInterface
  public datamodel: CoreDataModel<CoreDatum> = new CoreDataModel()
  public sizing: Sizing | string = Sizing.Fit // Supported by SingleContainer and a subset of components only (Sankey)
  public uid: string

  protected events: {
    [selector: string]: {
      [eventType in VisEventType]?: VisEventCallback;
    };
  } = {}

  /** Default configuration */
  protected _defaultConfig: ConfigInterface = ComponentDefaultConfig as ConfigInterface
  /** Component width in pixels. This property is set automatically by the container. */
  protected _width = 400
  /** Component height in pixels. This property is set automatically by the container. */
  protected _height = 200
  /** Container width in pixels. This property is set automatically by the container. */
  protected _containerWidth: number | undefined = undefined
  /** Container height in pixels. This property is set automatically by the container. */
  protected _containerHeight: number | undefined = undefined
  /** Container margin in pixels. This property is set automatically by the container. */
  protected _containerMargin: Spacing = { top: 0, bottom: 0, left: 0, right: 0 }

  _setUpComponentEventsThrottled = throttle(this._setUpComponentEvents, 500)

  /** Set the container margin. Called automatically by containers. */
  setContainerMargin (margin: Spacing): void {
    this._containerMargin = margin
  }

  _setCustomAttributesThrottled = throttle(this._setCustomAttributes, 500)

  constructor (type = ComponentType.SVG) {
    if (type === ComponentType.SVG) {
      this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    } else {
      this.element = document.createElement('div')
    }
    this.uid = guid()
    this.g = select(this.element) as Selection<SVGGElement, unknown, null, undefined> | Selection<HTMLElement, unknown, null, undefined>

    // Setting the root class if available
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line dot-notation
    const rootClass = this.constructor?.['selectors']?.root as string
    if (rootClass) this.g.attr('class', rootClass)
  }

  setConfig (config: ConfigInterface): void {
    this.prevConfig = this.config // Store the previous config instance
    this.config = merge(this._defaultConfig, config)
  }

  setData (data: CoreDatum): void {
    this.datamodel.data = data
  }

  setSize (width: number, height: number, containerWidth: number, containerHeight: number): void {
    if (isFinite(width)) this._width = width
    if (isFinite(height)) this._height = height
    if (isFinite(containerWidth)) this._containerWidth = containerWidth
    if (isFinite(containerHeight)) this._containerHeight = containerHeight
  }

  render (duration = this.config.duration): void {
    this._render(duration)

    // While transition is in progress, we add the 'animating' attribute to the component's SVG group
    const ANIMATING_ATTR = 'animating'
    if (duration) {
      this.g.attr(ANIMATING_ATTR, '')
      const transition = this.g
        .transition(ANIMATING_ATTR)
        .duration(duration) as Transition<SVGGElement | HTMLElement, unknown, null, undefined>

      transition.on('end interrupt', () => {
        this.g.attr(ANIMATING_ATTR, null)
      })
    }
    this._setUpComponentEventsThrottled()
    this._setCustomAttributesThrottled()
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _render (duration = this.config.duration): void {
  }

  private _setCustomAttributes (): void {
    const attributeMap = this.config.attributes

    Object.keys(attributeMap).forEach(className => {
      Object.keys(attributeMap[className]).forEach(attr => {
        const selection = (this.g as Selection<SVGGElement | HTMLElement, unknown, null, undefined>)
          .selectAll<SVGGElement | HTMLElement, unknown>(`.${className}`)

        selection.attr(attr, attributeMap[className][attr] as ValueFn<SVGGElement | HTMLElement, unknown, string | number | boolean>)
      })
    })
  }

  private _setUpComponentEvents (): void {
    // Set up default events
    this._bindEvents(this.events)

    // Set up user-defined events
    this._bindEvents(this.config.events, '.user')
  }

  private _bindEvents (events = this.events, suffix = ''): void {
    Object.keys(events).forEach(className => {
      Object.keys(events[className]).forEach(eventType => {
        const selection = (this.g as Selection<SVGGElement | HTMLElement, unknown, null, undefined>)
          .selectAll<SVGGElement | HTMLElement, unknown>(`.${className}`)
        selection.on(eventType + suffix, (event: MouseEvent & WheelEvent & PointerEvent & TouchEvent, d) => {
          const els = selection.nodes()
          const i = els.indexOf(event.currentTarget as SVGGElement | HTMLElement)
          const eventFunction = events[className][eventType as VisEventType]
          return eventFunction?.(d, event, i, els)
        })
      })
    })
  }

  public destroy (): void {
    this.g?.remove()
    this.element = undefined
  }

  public isDestroyed (): boolean {
    return !this.element
  }
}
