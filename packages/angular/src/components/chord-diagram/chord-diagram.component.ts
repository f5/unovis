// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  ChordDiagram,
  ChordDiagramConfigInterface,
  ContainerCore,
  ChordInputNode,
  ChordInputLink,
  VisEventType,
  VisEventCallback,
  ColorAccessor,
  ChordLinkDatum,
  NumericAccessor,
  ChordNodeDatum,
  StringAccessor,
  GenericAccessor,
  ChordLabelAlignment,
} from '@unovis/ts'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-chord-diagram',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisChordDiagramComponent }],
})
export class VisChordDiagramComponent<N extends ChordInputNode, L extends ChordInputLink> implements ChordDiagramConfigInterface<N, L>, AfterViewInit {
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

  /** Node id or index to highlight. Overrides default hover behavior if supplied. Default: `undefined` */
  @Input() highlightedNodeId?: number | string

  /** Link ids or index values to highlight. Overrides default hover behavior if supplied. Default: [] */
  @Input() highlightedLinkIds?: (number | string)[]

  /** Link color accessor function. Default: `var(--vis-chord-diagram-link-fill-color)` */
  @Input() linkColor?: ColorAccessor<ChordLinkDatum<N, L>>

  /** Link value accessor function. Default: `l => l.value` */
  @Input() linkValue?: NumericAccessor<ChordLinkDatum<N, L>>

  /** Array of node hierarchy levels. Data records are supposed to have corresponding properties, e.g. ['level1', 'level2']. Default: `[]` */
  @Input() nodeLevels?: string[]

  /** Node width in pixels. Default: `15` */
  @Input() nodeWidth?: number

  /** Node color accessor function ot constant value. Default: `d => d.color` */
  @Input() nodeColor?: ColorAccessor<ChordNodeDatum<N>>

  /** Node label accessor function. Default: `d => d.label ?? d.key` */
  @Input() nodeLabel?: StringAccessor<ChordNodeDatum<N>>

  /** Node label color accessor function. Default: `undefined` */
  @Input() nodeLabelColor?: StringAccessor<ChordNodeDatum<N>>

  /** Node label alignment. Default: `ChordLabelAlignment.Along` */
  @Input() nodeLabelAlignment?: GenericAccessor<ChordLabelAlignment | string, ChordNodeDatum<N>>

  /** Pad angle in radians. Default: `0.02` */
  @Input() padAngle?: number

  /** Corner radius constant value or accessor function. Default: `2` */
  @Input() cornerRadius?: NumericAccessor<ChordNodeDatum<N>>

  /** Angular range of the diagram. Default: `[0, 2 * Math.PI]` */
  @Input() angleRange?: [number, number]

  /** The exponent property of the radius scale. Default: `2` */
  @Input() radiusScaleExponent?: number
  @Input() data: { nodes: N[]; links?: L[] }

  component: ChordDiagram<N, L> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new ChordDiagram<N, L>(this.getConfig())

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

  private getConfig (): ChordDiagramConfigInterface<N, L> {
    const { duration, events, attributes, highlightedNodeId, highlightedLinkIds, linkColor, linkValue, nodeLevels, nodeWidth, nodeColor, nodeLabel, nodeLabelColor, nodeLabelAlignment, padAngle, cornerRadius, angleRange, radiusScaleExponent } = this
    const config = { duration, events, attributes, highlightedNodeId, highlightedLinkIds, linkColor, linkValue, nodeLevels, nodeWidth, nodeColor, nodeLabel, nodeLabelColor, nodeLabelAlignment, padAngle, cornerRadius, angleRange, radiusScaleExponent }
    const keys = Object.keys(config) as (keyof ChordDiagramConfigInterface<N, L>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
