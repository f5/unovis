/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Area, AreaConfigInterface, CurveType } from '@volterra/vis'
import { NumericAccessor, StringAccessor } from '@volterra/vis/src/types/accessor'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-area',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAreaComponent }],
})
export class VisAreaComponent<T> implements AreaConfigInterface<T>, AfterViewInit {
  /**
   * Empty component for inheritance demo
   */
  @Input() curveType: CurveType = CurveType.MonotoneX;
  @Input() baseline: NumericAccessor<T> = undefined;
  @Input() opacity: NumericAccessor<T> = 1;
  @Input() cursor: StringAccessor<T> = null;
  @Input() x: any
  @Input() y: any
  @Input() id: any
  @Input() color: string
  @Input() scales: any
  @Input() adaptiveYScale: any
  @Input() events: any
  @Input() duration: any
  @Input() width: any
  @Input() height: any
  @Input() attributes: any
  @Input() data: any

  component: Area<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Area<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): AreaConfigInterface<T> {
    const { curveType, baseline, opacity, cursor, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { curveType, baseline, opacity, cursor, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof AreaConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
