/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Crosshair, CrosshairConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-crosshair',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisCrosshairComponent }],
})
export class VisCrosshairComponent<T> implements CrosshairConfigInterface<T>, AfterViewInit {
  @Input() yStacked: any
  @Input() baseline: any
  @Input() tooltip: any
  @Input() template: any
  @Input() hideWhenFarFromPointer: any
  @Input() hideWhenFarFromPointerDistance: any
  @Input() x: any
  @Input() y: any
  @Input() id: any
  @Input() color: any
  @Input() scales: any
  @Input() adaptiveYScale: any
  @Input() events: any
  @Input() duration: any
  @Input() width: any
  @Input() height: any
  @Input() attributes: any
  @Input() data: any

  component: Crosshair<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Crosshair<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): CrosshairConfigInterface<T> {
    const { yStacked, baseline, tooltip, template, hideWhenFarFromPointer, hideWhenFarFromPointerDistance, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { yStacked, baseline, tooltip, template, hideWhenFarFromPointer, hideWhenFarFromPointerDistance, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof CrosshairConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
