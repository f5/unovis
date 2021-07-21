/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { StackedBar, StackedBarConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-stacked-bar',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisStackedBarComponent }],
})
export class VisStackedBarComponent<T> implements StackedBarConfigInterface<T>, AfterViewInit {
  @Input() barWidth: any
  @Input() barMaxWidth: any
  @Input() dataStep: any
  @Input() barPadding: any
  @Input() isVertical: any
  @Input() roundedCorners: any
  @Input() cursor: any
  @Input() barMinHeight: any
  @Input() barMinHeightZeroValue: any
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

  component: StackedBar<T> | undefined

  ngAfterViewInit (): void {
    this.component = new StackedBar<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): StackedBarConfigInterface<T> {
    const { barWidth, barMaxWidth, dataStep, barPadding, isVertical, roundedCorners, cursor, barMinHeight, barMinHeightZeroValue, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { barWidth, barMaxWidth, dataStep, barPadding, isVertical, roundedCorners, cursor, barMinHeight, barMinHeightZeroValue, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof StackedBarConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
