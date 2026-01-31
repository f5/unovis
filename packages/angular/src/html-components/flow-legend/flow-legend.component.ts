// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core'
import { FlowLegend, FlowLegendConfigInterface, Spacing } from '@unovis/ts'
import { VisGenericComponent } from '../../core'

@Component({
  selector: 'vis-flow-legend',
  template: '<div #container class="flow-legend-container"></div>',
  styles: ['.flow-legend-container {  }'],
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisFlowLegendComponent }],
})
export class VisFlowLegendComponent implements FlowLegendConfigInterface, AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef

  /** Margin around the legend. Default: `undefined` */
  @Input() margin?: Spacing

  /** Custom width of the component.  Default: `undefined` */
  @Input() customWidth?: number

  /** Legend items array as string[]. Default: `[]` */
  @Input() items?: string[]

  /** Spacing between legend items and the arrows in pixels. Default: `undefined` (fit to container width) */
  @Input() spacing?: number

  /** Color of the flow line. Default: `undefined` */
  @Input() lineColor?: string

  /** Color of the flow label. Default: `undefined` */
  @Input() labelColor?: string

  /** Font size of flow labels in pixels. Default: `12` */
  @Input() labelFontSize?: number

  /** Arrow symbol. Default: `'▶'` */
  @Input() arrowSymbol?: string

  /** Color of the arrow. Default: `undefined` */
  @Input() arrowColor?: string

  /** Offset of the arrow symbol vertically in pixels. Default: `undefined` */
  @Input() arrowSymbolYOffset?: number

  /** Callback function for the legend item click. Default: `undefined` */
  @Input() onLegendItemClick?: ((label?: string, i?: number) => void)

  component: FlowLegend | undefined

  ngAfterViewInit (): void {
    this.component = new FlowLegend(this.containerRef.nativeElement, { ...this.getConfig(), renderIntoProvidedDomNode: true })
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): FlowLegendConfigInterface {
    const { margin, customWidth, items, spacing, lineColor, labelColor, labelFontSize, arrowSymbol, arrowColor, arrowSymbolYOffset, onLegendItemClick } = this
    const config = { margin, customWidth, items, spacing, lineColor, labelColor, labelFontSize, arrowSymbol, arrowColor, arrowSymbolYOffset, onLegendItemClick }
    const keys = Object.keys(config) as (keyof FlowLegendConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
