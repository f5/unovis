// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, AfterViewInit, Input } from '@angular/core'
import { Position, PositionStrategy, Tooltip, TooltipConfigInterface } from '@volterra/vis'
import { VisGenericComponent } from '../index'

@Component({
  selector: 'vis-tooltip',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisTooltipComponent }],
})
export class VisTooltipComponent<T> implements TooltipConfigInterface<any, T>, AfterViewInit {
  /** An array of visualization components to interact with. Default: `[]` */
  @Input() components?: T[];
  /** Container to where the Tooltip component should be inserted. Default: `undefined` */
  @Input() container?: HTMLElement;
  /** Horizontal placement of the tooltip. Default: `Position.Auto` */
  @Input() horizontalPlacement?: Position | string | undefined;
  /** Horizontal shift of the tooltip in pixels. Default: `0` */
  @Input() horizontalShift?: number;
  /** Vertical placement of the tooltip. Default: `Position.Top` */
  @Input() verticalPlacement?: Position | string | undefined;
  /** Vertical shift of the tooltip in pixels. Default: `0` */
  @Input() verticalShift?: number;
  /** Tooltip positioning within the container: absolute or fixed. Default: `PositionStrategy.Absolute` */
  @Input() positionStrategy?: PositionStrategy | string;
  /** Defines the content of the tooltip and hovering over which elements should trigger it.
   * An object containing properties in the following format:
   *
   * ```
   * {
   *   [selectorString]: (d) => string | HTMLElement
   * }
   * ```
   * e.g.:
   * ```
   * {
   *   [Area.selectors.area]: (d) => `<div>${d.value.toString()}</div>
   * }
   * ```
   */
  @Input() triggers?: {
    [selector: string]: (data: any, i: number, elements: (HTMLElement | SVGElement)[]) => string | HTMLElement;
  };

  component: Tooltip<any, T> | undefined

  ngAfterViewInit (): void {
    this.component = new Tooltip<any, T>(this.getConfig())
  }

  ngOnChanges (): void {
    // Todo: Add setConfig functionality to the Tooltip component
    // this.component?.setConfig(this.getConfig())
  }

  getConfig (): TooltipConfigInterface<any, T> {
    const { components, container, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, positionStrategy, triggers } = this
    const config = { components, container, horizontalPlacement, horizontalShift, verticalPlacement, verticalShift, positionStrategy, triggers }
    const keys = Object.keys(config) as (keyof TooltipConfigInterface<any, T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
