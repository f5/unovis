// !!! This code was automatically generated. You should not change it !!!
import { Directive, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Line, LineConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '@src/core'

@Directive({
  selector: 'vis-line',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisLineComponent }],
})
export class VisLineComponent<T> implements LineConfigInterface<T>, AfterViewInit {
  @Input() curveType: any
  @Input() lineWidth: any
  @Input() lineDashArray: any
  @Input() noDataValue: any
  @Input() highlightOnHover: any
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

  component: Line<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Line<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): LineConfigInterface<T> {
    const { curveType, lineWidth, lineDashArray, noDataValue, highlightOnHover, cursor, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { curveType, lineWidth, lineDashArray, noDataValue, highlightOnHover, cursor, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof LineConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
