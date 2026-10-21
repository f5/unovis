import { Component, AfterViewInit, Input, SimpleChanges, TemplateRef, EmbeddedViewRef, ViewContainerRef, OnDestroy, inject } from '@angular/core'
import {
  Tooltip,
  TooltipConfigInterface,
  ContainerCore,
  ComponentCore,
  Position,
  TooltipContentMap,
  TooltipContent,
  getTooltipContentTargets,
} from '@unovis/ts'
import { VisGenericComponent } from '../../core'

@Component({
  selector: 'vis-tooltip',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisTooltipComponent }],
  standalone: false,
})
export class VisTooltipComponent implements Omit<TooltipConfigInterface, 'content'>, AfterViewInit, OnDestroy {
  private contentView?: EmbeddedViewRef<TooltipContent>
  private activeTemplate?: TemplateRef<TooltipContent>
  private activeContent: TooltipContent | null = null

  private viewContainer = inject(ViewContainerRef)

  private renderContent = (content: TooltipContent | null): void => {
    const template = content?.trigger !== undefined ? this.content?.[content.trigger] : undefined
    this.activeContent = template ? content : null
    if (!content || template !== this.activeTemplate) {
      this.contentView?.destroy()
      this.contentView = undefined
      this.activeTemplate = template
    }
    if (!content || !template) return
    if (!this.contentView) {
      this.contentView = this.viewContainer.createEmbeddedView(template, content)
      this.contentView.rootNodes.forEach(node => this.component.contentElement.appendChild(node))
    } else {
      this.contentView.context = content
    }
    this.contentView.detectChanges()
  }

  ngOnDestroy (): void {
    this.component?.setContentRenderer(undefined)
    this.contentView?.destroy()
    this.component?.destroy()
  }


  /** An array of visualization components to interact with. Default: `[]` */
  @Input() components?: ComponentCore<unknown>[]

  /** Container to where the Tooltip component should be inserted. Default: `undefined` */
  @Input() container?: HTMLElement

  /** Follow the mouse cursor. Default: `true` */
  @Input() followCursor?: boolean

  /** Allow the tooltip to be hovered over and interacted with. Default: `false` */
  @Input() allowHover?: boolean

  /** Horizontal placement of the tooltip. Default: `Position.Auto` */
  @Input() horizontalPlacement?: Position | string | undefined

  /** Horizontal shift of the tooltip in pixels. Works only with
   * `horizontalPlacement` set to `Position.Left` or `Position.Right`.
   * Default: `0` */
  @Input() horizontalShift?: number

  /** Vertical placement of the tooltip. Default: `Position.Top` */
  @Input() verticalPlacement?: Position | string | undefined

  /** Vertical shift of the tooltip in pixels. Works only with
   * `verticalPlacement` set to `Position.Top` or `Position.Bottom`.
   * Default: `0` */
  @Input() verticalShift?: number

  /** Content keyed by component selector. Vanilla callbacks receive
   * a TooltipContent context and return HTML, an HTMLElement, or null to hide. Default: undefined */
  @Input() content?: TooltipContentMap<TemplateRef<TooltipContent<any>>>

  /** @deprecated Use content to map selectors to native templates. */
  @Input() triggers?: TooltipConfigInterface['triggers']

  /** Custom DOM attributes for the tooltip. Useful when you need to refer to a specific tooltip instance
   * by using a CSS selector. Attributes configuration object has the following structure:
   *
   * ```
   * {
   * \[attributeName]: attribute value
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \'type': 'area-tooltip',
   * \'value': 42
   * }
   * ``` */
  @Input() attributes?: {
    [attr: string]: string | number | boolean;
  }

  /** Custom class name for the tooltip. Default: `undefined` */
  @Input() className?: string

  /** Hide delay in milliseconds. Default: `undefined` */
  @Input() hideDelay?: number

  /** Show delay in milliseconds. Default: `undefined` */
  @Input() showDelay?: number

  component: Tooltip | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Tooltip(this.getConfig())
    this.component.setContentRenderer(this.renderContent, getTooltipContentTargets(this.content))
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
    this.component?.setContentRenderer(this.renderContent, getTooltipContentTargets(this.content))
    if (changes.content && this.activeContent) {
      this.renderContent(this.activeContent)
      if (!this.activeContent) this.component?.hide()
    }
    this.componentContainer?.render()
  }

  private getConfig (): TooltipConfigInterface {
    const { components, container, followCursor, allowHover, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, triggers, attributes, className, hideDelay, showDelay } = this
    const config = { components, container, followCursor, allowHover, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, triggers, attributes, className, hideDelay, showDelay }
    const keys = Object.keys(config) as (keyof TooltipConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
