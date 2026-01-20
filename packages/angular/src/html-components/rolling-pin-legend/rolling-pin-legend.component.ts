// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core'
import { RollingPinLegend, RollingPinLegendConfigInterface, RollingPinLegendItem } from '@unovis/ts'
import { VisGenericComponent } from '../../core'

@Component({
  selector: 'vis-rolling-pin-legend',
  template: '<div #container class="rolling-pin-legend-container"></div>',
  styles: ['.rolling-pin-legend-container {  }'],
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisRollingPinLegendComponent }],
  standalone: false,
})
export class VisRollingPinLegendComponent implements RollingPinLegendConfigInterface, AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef

  /** Rects forming a legend. Array of `string`, representing colors.
   *
   * Default: `[]` */
  @Input() rects: RollingPinLegendItem[]

  /** Label on the left side of the legend. Default: `undefined` */
  @Input() leftLabelText?: string

  /** Label on the right side of the legend. Default: `undefined` */
  @Input() rightLabelText?: string

  /** Apply a specific class to the labels. Default: `''` */
  @Input() labelClassName?: string

  /** Label text (<span> element) font-size CSS. Default: `null` */
  @Input() labelFontSize?: string | null

  component: RollingPinLegend | undefined

  ngAfterViewInit (): void {
    this.component = new RollingPinLegend(this.containerRef.nativeElement, this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): RollingPinLegendConfigInterface {
    const { rects, leftLabelText, rightLabelText, labelClassName, labelFontSize } = this
    const config = { rects, leftLabelText, rightLabelText, labelClassName, labelFontSize }
    const keys = Object.keys(config) as (keyof RollingPinLegendConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
