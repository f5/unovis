// !!! This code was automatically generated. You should not change it !!!
import { Directive, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Brush, BrushConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '@src/core'

@Directive({
  selector: 'vis-brush',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisBrushComponent }],
})
export class VisBrushComponent<T> implements BrushConfigInterface<T>, AfterViewInit {
  @Input() onBrush: any
  @Input() onBrushStart: any
  @Input() onBrushMove: any
  @Input() onBrushEnd: any
  @Input() handleWidth: any
  @Input() selection: any
  @Input() draggable: any
  @Input() handlePosition: any
  @Input() selectionMinLength: any
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

  component: Brush<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Brush<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): BrushConfigInterface<T> {
    const { onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof BrushConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
