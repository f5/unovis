/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Directive, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { GroupedBar, GroupedBarConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Directive({
  selector: 'vis-grouped-bar',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisGroupedBarComponent }],
})
export class VisGroupedBarComponent<T> implements GroupedBarConfigInterface<T>, AfterViewInit {
  @Input() groupWidth: any
  @Input() groupMaxWidth: any
  @Input() dataStep: any
  @Input() groupPadding: any
  @Input() barPadding: any
  @Input() isVertical: any
  @Input() roundedCorners: any
  @Input() barMinHeight: any
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

  component: GroupedBar<T> | undefined

  ngAfterViewInit (): void {
    this.component = new GroupedBar<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): GroupedBarConfigInterface<T> {
    const { groupWidth, groupMaxWidth, dataStep, groupPadding, barPadding, isVertical, roundedCorners, barMinHeight, cursor, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { groupWidth, groupMaxWidth, dataStep, groupPadding, barPadding, isVertical, roundedCorners, barMinHeight, cursor, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof GroupedBarConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
