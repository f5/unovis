/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Tooltip, TooltipConfigInterface, ComponentCore, Position, PositionStrategy } from '@volterra/vis'
import { VisGenericComponent } from '../../core'

@Component({
  selector: 'vis-tooltip',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisTooltipComponent }],
})
export class VisTooltipComponent implements TooltipConfigInterface, AfterViewInit {
  /** An array of visualization components to interact with. Default: `[]` */
  @Input() components: ComponentCore<unknown>[]

  /** Container to where the Tooltip component should be inserted. Default: `undefined` */
  @Input() container: HTMLElement

  /** Horizontal placement of the tooltip. Default: `Position.Auto` */
  @Input() horizontalPlacement: Position | string | undefined

  /** Horizontal shift of the tooltip in pixels. Default: `0` */
  @Input() horizontalShift: number

  /** Vertical placement of the tooltip. Default: `Position.Top` */
  @Input() verticalPlacement: Position | string | undefined

  /** Vertical shift of the tooltip in pixels. Default: `0` */
  @Input() verticalShift: number

  /** Tooltip positioning within the container: absolute or fixed. Default: `PositionStrategy.Absolute` */
  @Input() positionStrategy: PositionStrategy | string

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
  @Input() triggers: {
    [selector: string]: (data: unknown, i: number, elements: (HTMLElement | SVGElement)[]) => string | HTMLElement | undefined | null;
  }

  component: Tooltip | undefined

  ngAfterViewInit (): void {
    this.component = new Tooltip(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): TooltipConfigInterface {
    const { components, container, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, positionStrategy, triggers } = this
    const config = { components, container, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, positionStrategy, triggers }
    const keys = Object.keys(config) as (keyof TooltipConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
