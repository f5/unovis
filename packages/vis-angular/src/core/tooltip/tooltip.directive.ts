// Copyright (c) Volterra, Inc. All rights reserved.
import { Directive, AfterViewInit, Input } from '@angular/core'
import { Tooltip, TooltipConfigInterface } from '@volterra/vis'
import { VisGenericComponent } from '../index'

@Directive({
  selector: 'vis-tooltip',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisTooltipComponent }],
})
export class VisTooltipComponent<T> implements TooltipConfigInterface<any, T>, AfterViewInit {
  @Input() components: any
  @Input() container: any
  @Input() horizontalPlacement: any
  @Input() horizontalShift: any
  @Input() verticalPlacement: any
  @Input() verticalShift: any
  @Input() positionStrategy: any
  @Input() triggers: any

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
