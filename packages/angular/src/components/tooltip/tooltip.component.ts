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

  /** Horizontal placement of the tooltip. Default: `Position.Auto` */
  @Input() horizontalPlacement?: Position | string | undefined

  /** Horizontal shift of the tooltip in pixels. Default: `0` */
  @Input() horizontalShift?: number

  /** Vertical placement of the tooltip. Default: `Position.Top` */
  @Input() verticalPlacement?: Position | string | undefined

  /** Vertical shift of the tooltip in pixels. Default: `0` */
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
    [selector: string]: ((data: any, i: number, elements: (HTMLElement | SVGElement)[]) => string | HTMLElement | undefined | null) | undefined | null;
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
    const { components, container, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, triggers, attributes } = this
    const config = { components, container, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, triggers, attributes }
    const keys = Object.keys(config) as (keyof TooltipConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
