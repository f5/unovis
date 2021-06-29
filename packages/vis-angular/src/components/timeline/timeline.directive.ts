// !!! This code was automatically generated. You should not change it !!!
import { Directive, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Timeline, TimelineConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '@src/core'

@Directive({
  selector: 'vis-timeline',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisTimelineComponent }],
})
export class VisTimelineComponent<T> implements TimelineConfigInterface<T>, AfterViewInit {
  @Input() lineWidth: any
  @Input() rowHeight: any
  @Input() length: any
  @Input() type: any
  @Input() cursor: any
  @Input() x: any
  @Input() y: any
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

  component: Timeline<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Timeline<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): TimelineConfigInterface<T> {
    const { lineWidth, rowHeight, length, type, cursor, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { lineWidth, rowHeight, length, type, cursor, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof TimelineConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
