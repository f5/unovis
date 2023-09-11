// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Annotations, AnnotationsConfigInterface, ContainerCore, AnnotationDatum } from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-annotations',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAnnotationsComponent }],
})
export class VisAnnotationsComponent<Datum extends AnnotationDatum> implements AnnotationsConfigInterface<Datum>, AfterViewInit {
  @Input() duration?: number
  @Input() data: Datum[]

  component: Annotations<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Annotations<Datum>(this.getConfig())

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

  private getConfig (): AnnotationsConfigInterface<Datum> {
    const { duration } = this
    const config = { duration }
    const keys = Object.keys(config) as (keyof AnnotationsConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
