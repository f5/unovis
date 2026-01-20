// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core'
import {
  BulletLegend,
  BulletLegendConfigInterface,
  BulletLegendItemInterface,
  GenericAccessor,
  BulletShape,
  BulletLegendOrientation,
} from '@unovis/ts'
import { VisGenericComponent } from '../../core'

@Component({
  selector: 'vis-bullet-legend',
  template: '<div #container class="bullet-legend-container"></div>',
  styles: ['.bullet-legend-container {  }'],
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisBulletLegendComponent }],
  standalone: false,
})
export class VisBulletLegendComponent implements BulletLegendConfigInterface, AfterViewInit {
  @ViewChild('container', { static: false }) containerRef: ElementRef

  /** Legend items. Array of `BulletLegendItemInterface`:
   * ```
   * {
   *  name: string | number;
   *  color?: string;
   *  shape?: BulletShape;
   *  inactive?: boolean;
   *  hidden?: boolean;
   *  pointer?: boolean;
   * }
   * ```
   * Default: `[]` */
  @Input() items: BulletLegendItemInterface[]

  /** Apply a specific class to the labels. Default: `''` */
  @Input() labelClassName?: string

  /** Callback function for the legend item click. Default: `undefined` */
  @Input() onLegendItemClick?: ((d: BulletLegendItemInterface, i: number) => void)

  /** Label text (<span> element) font-size CSS. Default: `null` */
  @Input() labelFontSize?: string | null

  /** Label text (<span> element) max-width CSS property. Default: `null` */
  @Input() labelMaxWidth?: string | null

  /** Bullet shape size, mapped to the width and height CSS properties. Default: `null` */
  @Input() bulletSize?: string | null

  /** Spacing between multiple bullet symbols in pixels. Default: `4` */
  @Input() bulletSpacing?: number

  /** Bullet shape enum value or accessor function. Default: `d => d.shape ?? BulletShape.Circle */
  @Input() bulletShape?: GenericAccessor<BulletShape, BulletLegendItemInterface>

  /** Legend orientation. When set to `BulletLegendOrientation.Vertical`, each legend item will
   * start on a new line. Default: `BulletLegendOrientation.Horizontal` */
  @Input() orientation?: BulletLegendOrientation | string

  component: BulletLegend | undefined

  ngAfterViewInit (): void {
    this.component = new BulletLegend(this.containerRef.nativeElement, { ...this.getConfig(), renderIntoProvidedDomNode: true })
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): BulletLegendConfigInterface {
    const { items, labelClassName, onLegendItemClick, labelFontSize, labelMaxWidth, bulletSize, bulletSpacing, bulletShape, orientation } = this
    const config = { items, labelClassName, onLegendItemClick, labelFontSize, labelMaxWidth, bulletSize, bulletSpacing, bulletShape, orientation }
    const keys = Object.keys(config) as (keyof BulletLegendConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
