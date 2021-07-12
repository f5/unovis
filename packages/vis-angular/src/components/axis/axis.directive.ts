/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Directive, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Axis, AxisConfigInterface } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Directive({
  selector: 'vis-axis',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAxisComponent }],
})
export class VisAxisComponent<T> implements AxisConfigInterface<T>, AfterViewInit {
  @Input() position: any
  @Input() type: any
  @Input() padding: any
  @Input() fullSize: any
  @Input() label: any
  @Input() labelFontSize: any
  @Input() labelMargin: any
  @Input() gridLine: any
  @Input() tickLine: any
  @Input() domainLine: any
  @Input() minMaxTicksOnly: any
  @Input() tickFormat: any
  @Input() tickValues: any
  @Input() numTicks: any
  @Input() tickTextFitMode: any
  @Input() tickTextLength: any
  @Input() tickTextWidth: any
  @Input() tickTextSeparator: any
  @Input() tickTextForceWordBreak: any
  @Input() tickTextTrimType: any
  @Input() tickTextFontSize: any
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

  component: Axis<T> | undefined

  ngAfterViewInit (): void {
    this.component = new Axis<T>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  getConfig (): AxisConfigInterface<T> {
    const { position, type, padding, fullSize, label, labelFontSize, labelMargin, gridLine, tickLine, domainLine, minMaxTicksOnly, tickFormat, tickValues, numTicks, tickTextFitMode, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak, tickTextTrimType, tickTextFontSize, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes } = this
    const config = { position, type, padding, fullSize, label, labelFontSize, labelMargin, gridLine, tickLine, domainLine, minMaxTicksOnly, tickFormat, tickValues, numTicks, tickTextFitMode, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak, tickTextTrimType, tickTextFontSize, x, y, id, color, colorType, scales, adaptiveYScale, events, duration, width, height, attributes }
    const keys = Object.keys(config) as (keyof AxisConfigInterface<T>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
