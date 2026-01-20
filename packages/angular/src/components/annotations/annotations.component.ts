// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Annotations, AnnotationsConfigInterface, ContainerCore, VisEventType, VisEventCallback, AnnotationItem } from '@unovis/ts'
import { VisGenericComponent } from '../../core'

@Component({
  selector: 'vis-annotations',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisGenericComponent, useExisting: VisAnnotationsComponent }],
  standalone: false,
})
export class VisAnnotationsComponent implements AnnotationsConfigInterface, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration?: number

  /** Events configuration. An object containing properties in the following format:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[eventType]: callbackFunction
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    click: (d) => console.log("Clicked Area", d)
   *  }
   * }
   * ``` */
  @Input() events?: {
    [selector: string]: {
      [eventType in VisEventType]?: VisEventCallback
    };
  }

  /** You can set every SVG and HTML visualization object to have a custom DOM attributes, which is useful
   * when you want to do unit or end-to-end testing. Attributes configuration object has the following structure:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[attributeName]: attribute constant value or accessor function
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    "test-value": d => d.value
   *  }
   * }
   * ``` */
  @Input() attributes?: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

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

  /** Debug option to render bounding boxes around text elements. Default: `false` */
  @Input() renderTextBoundingBoxes?: boolean

  component: Annotations | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Annotations(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): AnnotationsConfigInterface {
    const { duration, events, attributes, items, renderTextBoundingBoxes } = this
    const config = { duration, events, attributes, items, renderTextBoundingBoxes }
    const keys = Object.keys(config) as (keyof AnnotationsConfigInterface)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
