// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Annotations, AnnotationsConfigInterface, ContainerCore, AnnotationItem } from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-annotations',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAnnotationsComponent }],
})
export class VisAnnotationsComponent implements AnnotationsConfigInterface, AfterViewInit {
  /** Legend items. Array of `AnnotationItem`:
   * ```
   * {
   *  content: string | UnovisText | UnovisText[];
   *  subject?: AnnotationSubject;
   *  x?: LengthUnit;
   *  y?: LengthUnit;
   *  width?: LengthUnit;
   *  height?: LengthUnit;
   * }
   * ```
   * To learn more, see our docs https://unovis.dev/docs/auxiliary/Annotations/
   * Default: `[]` */
  @Input() items: AnnotationItem[] | undefined
  @Input() data: Datum[]

  component: Annotations | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Annotations(this.getConfig())

    if (this.data) {
      this.component.setData(this.data)
      this.componentContainer?.render()
    }
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): AnnotationsConfigInterface {
    const { items } = this
    const config = { items }
    const keys = Object.keys(config) as (keyof AnnotationsConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
