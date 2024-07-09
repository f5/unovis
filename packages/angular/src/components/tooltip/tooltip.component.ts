// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Tooltip, TooltipConfigInterface, ContainerCore, ComponentCore, Position } from '@unovis/ts'
import { VisGenericComponent } from '../../core'

@Component({
  selector: 'vis-tooltip',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisTooltipComponent }],
})
export class VisTooltipComponent implements TooltipConfigInterface, AfterViewInit {
  /** An array of visualization components to interact with. Default: `[]` */
  @Input() components?: ComponentCore<unknown>[]

  /** Container to where the Tooltip component should be inserted. Default: `undefined` */
  @Input() container?: HTMLElement

  /** Follow the mouse cursor. If `true`, the tooltip can't be hovered over
   * even when `allowHover` is set to `true`. Default: `true` */
  @Input() followCursor?: boolean

  /** Allow the tooltip to be hovered over and interacted with when `followCursor` is set to `false`.
   * Default: `true` */
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

  /** Defines the content of the tooltip and hovering over which elements should trigger it.
   * An object containing properties in the following format:
   *
   * ```
   * {
   * \[selectorString]: (d: unknown) => string | HTMLElement
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: (d: AreaDatum[]) => `<div>${d.value.toString()}</div>
   * }
   * ``` */
  @Input() triggers?: {
    [selector: string]: ((data: any, i: number, elements: (HTMLElement | SVGElement)[]) => string | HTMLElement | undefined | null | void) | undefined | null;
  }

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

  component: Tooltip | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Tooltip(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): TooltipConfigInterface {
    const { components, container, followCursor, allowHover, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, triggers, attributes, className } = this
    const config = { components, container, followCursor, allowHover, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, triggers, attributes, className }
    const keys = Object.keys(config) as (keyof TooltipConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
