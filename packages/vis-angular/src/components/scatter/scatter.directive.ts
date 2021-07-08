/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Directive, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Scatter, ScatterConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Directive({
  selector: 'vis-scatter',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisScatterComponent }],
})
export class VisScatterComponent<T> implements ScatterConfigInterface<T>, AfterViewInit {
  @Input() y: any
  @Input() size: any
  @Input() sizeScale: any
  @Input() sizeRange: any
  @Input() shape: any
  @Input() label: any
  @Input() labelColor: any
  @Input() cursor: any
  @Input() labelTextBrightnessRatio: any
  @Input() x: any
  @Input() id: any
  @Input() color: any
  @Input() colorType: any
  @Input() scales: any
  @Input() adaptiveYScale: any
  @Input() events: any
  @Input() duration: any
  @Input() width: any
  @Input() height: any
  @Input() attributes: any
  @Input() data: any

  component: Scatter<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Scatter<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): ScatterConfigInterface<T> {
    const { y, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio, x, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { y, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio, x, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof ScatterConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
