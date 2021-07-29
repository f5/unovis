/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Donut, DonutConfigInterface } from '@volterra/vis'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-donut',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisDonutComponent }],
})
export class VisDonutComponent<T> implements DonutConfigInterface<T>, AfterViewInit {
  @Input() id: any
  @Input() value: any
  @Input() angleRange: any
  @Input() padAngle: any
  @Input() sortFunction: any
  @Input() cornerRadius: any
  @Input() color: any
  @Input() radius: any
  @Input() arcWidth: any
  @Input() centralLabel: any
  @Input() preventEmptySegments: any
  @Input() duration: any
  @Input() width: any
  @Input() height: any
  @Input() events: any
  @Input() attributes: any
  @Input() data: any

  component: Donut<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Donut<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): DonutConfigInterface<T> {
    const { id, value, angleRange, padAngle, sortFunction, cornerRadius, color, radius, arcWidth, centralLabel, preventEmptySegments, duration, width, height, events, attributes } = this
    const config = { id, value, angleRange, padAngle, sortFunction, cornerRadius, color, radius, arcWidth, centralLabel, preventEmptySegments, duration, width, height, events, attributes }
    const keys = Object.keys(config) as (keyof DonutConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
