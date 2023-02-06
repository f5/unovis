// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Sankey,
  SankeyConfigInterface,
  ContainerCore,
  SankeyInputNode,
  SankeyInputLink,
  VisEventType,
  VisEventCallback,
  SankeyExitTransitionType,
  SankeyEnterTransitionType,
  SankeyNodeAlign,
  StringAccessor,
  SankeyNode,
  ColorAccessor,
  NumericAccessor,
  SankeyLink,
  GenericAccessor,
  Position,
  VerticalAlign,
  FitMode,
  TrimMode,
  SankeySubLabelPlacement,
} from '@unovis/ts'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-sankey',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisSankeyComponent }],
})
export class VisSankeyComponent<N extends SankeyInputNode, L extends SankeyInputLink> implements SankeyConfigInterface<N, L>, AfterViewInit {
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

  /** Node / Link id accessor function. Used for mapping of data updates to corresponding SVG objects. Default: `(d, i) => d.id ?? i.toString()` */
  @Input() id?: (d: SankeyInputNode | SankeyInputLink, i: number, ...rest) => string

  /** Coefficient to scale the height of the diagram when the amount of links is low: `C * links.length`, clamped to `[height / 2, height]`. Default: `1/16` */
  @Input() heightNormalizationCoeff?: number

  /** Type of animation on removing nodes. Default: `ExitTransitionType.Default` */
  @Input() exitTransitionType?: SankeyExitTransitionType

  /** Type of animation on creating nodes. Default: `EnterTransitionType.Default` */
  @Input() enterTransitionType?: SankeyEnterTransitionType

  /** Highlight the corresponding subtree on node / link hover. Default: `false` */
  @Input() highlightSubtreeOnHover?: boolean

  /** Highlight animation duration, ms. Default: `400` */
  @Input() highlightDuration?: number

  /** Highlight delay, ms. Default: `1000` */
  @Input() highlightDelay?: number

  /** Sankey algorithm iterations. Default: `32` */
  @Input() iterations?: number

  /** Sankey node sorting function. Default: `undefined`.
   * Node sorting is applied to nodes in one layer (column). Layer by layer.
   * Options: `undefined` - the order is determined by the layout;
   *          `null` - the order is fixed by the input;
   *          sort function - the order is determined by the function. */
  @Input() nodeSort?: ((node1: N, node2: N) => number) | null | undefined

  /** Sankey link sorting function. Default: `(link2, link1) => link1.value - link2.value`.
   * Link sorting is applied to the source (exiting) links within one node.
   * Options: `undefined` - the order is determined by the layout;
   *          `null` - the order is fixed by the input;
   *          sort function - the order is determined by the function. */
  @Input() linkSort?: ((link1: L, link2: L) => number) | null | undefined

  /** Sankey node width in pixels */
  @Input() nodeWidth?: number

  /** Sankey node alignment method */
  @Input() nodeAlign?: SankeyNodeAlign

  /** Horizontal space between the nodes. Extended Sizing property only. Default: `150` */
  @Input() nodeHorizontalSpacing?: number

  /** Minimum node height. Extended Sizing property only. Default: `20` */
  @Input() nodeMinHeight?: number

  /** Maximum node height. Extended Sizing property only. Default: `100` */
  @Input() nodeMaxHeight?: number

  /** Sankey vertical separation between nodes in pixels. Default: `2` */
  @Input() nodePadding?: number

  /** Display the graph when data has just one element */
  @Input() showSingleNode?: boolean

  /** Node cursor on hover. Default: `undefined` */
  @Input() nodeCursor?: StringAccessor<SankeyNode<N, L>>

  /** Node icon accessor function or value. Default: `undefined` */
  @Input() nodeIcon?: StringAccessor<SankeyNode<N, L>>

  /** Node color accessor function or value. Default: `undefined` */
  @Input() nodeColor?: ColorAccessor<SankeyNode<N, L>>

  /** Node `fixedValue` accessor function or constant. It defines the node value that will be used to calculate
   * the height of the nodes by d3-sankey (by default the height will be based on aggregated `linkValue`).
   * Default: `n => n.fixedValue` */
  @Input() nodeFixedValue?: NumericAccessor<N>

  /** Icon color accessor function or value. Default: `undefined` */
  @Input() nodeIconColor?: ColorAccessor<SankeyNode<N, L>>

  /** Link color accessor function or value. Default: `l => l.color` */
  @Input() linkColor?: StringAccessor<SankeyLink<N, L>>

  /** Link flow accessor function or value. Default: `l => l.value` */
  @Input() linkValue?: NumericAccessor<L>

  /** Link cursor on hover. Default: `undefined` */
  @Input() linkCursor?: StringAccessor<SankeyLink<N, L>>

  /** Node label accessor function or value. Default: `n => n.label` */
  @Input() label?: StringAccessor<SankeyNode<N, L>>

  /** Node sub-label accessor function or value. Default: `undefined` */
  @Input() subLabel?: StringAccessor<SankeyNode<N, L>>

  /** Label position relative to the Node. Default: `Position.AUTO` */
  @Input() labelPosition?: GenericAccessor<Position.Auto | Position.Left | Position.Right | string, SankeyNode<N, L>>

  /** Label vertical alignment */
  @Input() labelVerticalAlign?: VerticalAlign | string

  /** Label background */
  @Input() labelBackground?: boolean

  /** Label fit mode (wrap or trim). Default: `FitMode.TRIM` * */
  @Input() labelFit?: FitMode

  /** Maximum label with in pixels. Default: `70` */
  @Input() labelMaxWidth?: number

  /** Expand trimmed label on hover. Default: `true` */
  @Input() labelExpandTrimmedOnHover?: boolean

  /** Label trimming mode. Default: `TrimMode.MIDDLE` */
  @Input() labelTrimMode?: TrimMode

  /** Label font size in pixels. If not provided, the value of CSS variable `--vis-sankey-node-label-font-size` will be used. Default: `undefined` */
  @Input() labelFontSize?: number

  /** Label text separators for wrapping. Default: `[' ', '-']` */
  @Input() labelTextSeparator?: string[]

  /** Force break words to fit long labels. Default: `true` */
  @Input() labelForceWordBreak?: boolean

  /** Label color. Default: `undefined` */
  @Input() labelColor?: ColorAccessor<SankeyNode<N, L>>

  /** Label cursor on hover. Default: `undefined` */
  @Input() labelCursor?: StringAccessor<SankeyNode<N, L>>

  /** Custom function to set the label visibility. Default: `undefined` */
  @Input() labelVisibility?: ((d: SankeyNode<N, L>, bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  }, hovered: boolean) => boolean) | undefined

  /** Sub-label font size in pixels. If not provided, the value of CSS variable `--vis-sankey-node-sublabel-font-size` will be used. Default: `undefined` */
  @Input() subLabelFontSize?: number

  /** Sub-label color. Default: `undefined` */
  @Input() subLabelColor?: ColorAccessor<SankeyNode<N, L>>

  /** Sub-label position. Default: `SankeySubLabelPlacement.Below` */
  @Input() subLabelPlacement?: SankeySubLabelPlacement | string

  /** Sub-label to label width ratio when `subLabelPlacement` is set to `SankeySubLabelPlacement.Inline`
   * Default: `0.4`, which means that 40% of `labelMaxWidth` will be given to sub-label, and 60% to the main label. */
  @Input() subLabelToLabelInlineWidthRatio?: number
  @Input() data: any

  component: Sankey<N, L> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Sankey<N, L>(this.getConfig())

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

  private getConfig (): SankeyConfigInterface<N, L> {
    const { duration, events, attributes, id, heightNormalizationCoeff, exitTransitionType, enterTransitionType, highlightSubtreeOnHover, highlightDuration, highlightDelay, iterations, nodeSort, linkSort, nodeWidth, nodeAlign, nodeHorizontalSpacing, nodeMinHeight, nodeMaxHeight, nodePadding, showSingleNode, nodeCursor, nodeIcon, nodeColor, nodeFixedValue, nodeIconColor, linkColor, linkValue, linkCursor, label, subLabel, labelPosition, labelVerticalAlign, labelBackground, labelFit, labelMaxWidth, labelExpandTrimmedOnHover, labelTrimMode, labelFontSize, labelTextSeparator, labelForceWordBreak, labelColor, labelCursor, labelVisibility, subLabelFontSize, subLabelColor, subLabelPlacement, subLabelToLabelInlineWidthRatio } = this
    const config = { duration, events, attributes, id, heightNormalizationCoeff, exitTransitionType, enterTransitionType, highlightSubtreeOnHover, highlightDuration, highlightDelay, iterations, nodeSort, linkSort, nodeWidth, nodeAlign, nodeHorizontalSpacing, nodeMinHeight, nodeMaxHeight, nodePadding, showSingleNode, nodeCursor, nodeIcon, nodeColor, nodeFixedValue, nodeIconColor, linkColor, linkValue, linkCursor, label, subLabel, labelPosition, labelVerticalAlign, labelBackground, labelFit, labelMaxWidth, labelExpandTrimmedOnHover, labelTrimMode, labelFontSize, labelTextSeparator, labelForceWordBreak, labelColor, labelCursor, labelVisibility, subLabelFontSize, subLabelColor, subLabelPlacement, subLabelToLabelInlineWidthRatio }
    const keys = Object.keys(config) as (keyof SankeyConfigInterface<N, L>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
