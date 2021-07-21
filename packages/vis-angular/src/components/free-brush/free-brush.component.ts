/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { FreeBrush, FreeBrushConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-free-brush',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisFreeBrushComponent }],
})
export class VisFreeBrushComponent<T> implements FreeBrushConfigInterface<T>, AfterViewInit {
  @Input() mode: any
  @Input() onBrush: any
  @Input() onBrushStart: any
  @Input() onBrushMove: any
  @Input() onBrushEnd: any
  @Input() handleWidth: any
  @Input() selection: any
  @Input() selectionMinLength: any
  @Input() autoHide: any
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

  component: FreeBrush<T> | undefined

  ngAfterViewInit (): void {
    this.component = new FreeBrush<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): FreeBrushConfigInterface<T> {
    const { mode, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, selectionMinLength, autoHide, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { mode, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, selectionMinLength, autoHide, x, y, id, color, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof FreeBrushConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
