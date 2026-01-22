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
  SankeyZoomMode,
  SankeyExitTransitionType,
  SankeyEnterTransitionType,
  SankeyNode,
  SankeyLink,
  SankeyNodeAlign,
  StringAccessor,
  ColorAccessor,
  NumericAccessor,
  GenericAccessor,
  Position,
  VerticalAlign,
  FitMode,
  TrimMode,
  SankeySubLabelPlacement,
} from '@unovis/ts'
import { D3ZoomEvent } from 'd3-zoom'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-sankey',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisSankeyComponent }],
  standalone: false,
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

  /** Horizontal and vertical scale factor applied to the computed layout (column spacing). Keeps node width intact. Default: `undefined` */
  @Input() zoomScale?: [number, number]

  /** Pan offset in pixels. Default: `undefined` */
  @Input() zoomPan?: [number, number]

  /** Enable interactive zoom/pan behavior. Default: `true` */
  @Input() enableZoom?: boolean

  /** Allowed interactive zoom scale extent. Default: `[1, 5]` */
  @Input() zoomExtent?: [number, number]

  /** Zoom interaction mode. Default: `SankeyZoomMode.XY` */
  @Input() zoomMode?: SankeyZoomMode | string

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
  @Input() nodeSort?: ((node1: SankeyNode<N, L>, node2: SankeyNode<N, L>) => number) | null | undefined

  /** Sankey link sorting function. Default: `(link2, link1) => link1.value - link2.value`.
   * Link sorting is applied to the source (exiting) links within one node.
   * Options: `undefined` - the order is determined by the layout;
   *          `null` - the order is fixed by the input;
   *          sort function - the order is determined by the function. */
  @Input() linkSort?: ((link1: SankeyLink<N, L>, link2: SankeyLink<N, L>) => number) | null | undefined

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

  /** Label fit mode (wrap or trim). Default: `FitMode.Trim` * */
  @Input() labelFit?: FitMode

  /** Maximum label with in pixels. Default: `70` */
  @Input() labelMaxWidth?: number

  /** Whether to take the available space for the label. This property is used only if `labelMaxWidth` is not provided. Default: `false` */
  @Input() labelMaxWidthTakeAvailableSpace?: boolean

  /** Tolerance for the available space for the label. This property is used only if `labelMaxWidthTakeAvailableSpace` is `true`. Default: `undefined` (use label and sub-label font sizes) */
  @Input() labelMaxWidthTakeAvailableSpaceTolerance?: number

  /** Expand trimmed label on hover. Default: `true` */
  @Input() labelExpandTrimmedOnHover?: boolean

  /** Label trimming mode. Default: `TrimMode.Middle` */
  @Input() labelTrimMode?: TrimMode

  /** Label font size in pixels. If not provided, the value of CSS variable `--vis-sankey-node-label-font-size` will be used. Default: `undefined` */
  @Input() labelFontSize?: number

  /** Label text separators for wrapping. Default: `[' ', '-']` */
  @Input() labelTextSeparator?: string[]

  /** Label text decoration. Default: `undefined` */
  @Input() labelTextDecoration?: StringAccessor<SankeyNode<N, L>>

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

  /** Sub-label text decoration. Default: `undefined` */
  @Input() subLabelTextDecoration?: StringAccessor<SankeyNode<N, L>>

  /** Sub-label to label width ratio when `subLabelPlacement` is set to `SankeySubLabelPlacement.Inline`
   * Default: `0.4`, which means that 40% of `labelMaxWidth` will be given to sub-label, and 60% to the main label. */
  @Input() subLabelToLabelInlineWidthRatio?: number

  /** Zoom event callback. Default: `undefined` */
  @Input() onZoom?: (horizontalScale: number, verticalScale: number, panX: number, panY: number, zoomExtent: [number, number], event: D3ZoomEvent<SVGGElement, unknown> | undefined) => void

  /** Set selected nodes by unique id. Default: `undefined` */
  @Input() selectedNodeIds?: string[]
  @Input() data: { nodes: N[]; links?: L[] }

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
    const { duration, events, attributes, id, heightNormalizationCoeff, zoomScale, zoomPan, enableZoom, zoomExtent, zoomMode, exitTransitionType, enterTransitionType, highlightSubtreeOnHover, highlightDuration, highlightDelay, iterations, nodeSort, linkSort, nodeWidth, nodeAlign, nodeHorizontalSpacing, nodeMinHeight, nodeMaxHeight, nodePadding, showSingleNode, nodeCursor, nodeIcon, nodeColor, nodeFixedValue, nodeIconColor, linkColor, linkValue, linkCursor, label, subLabel, labelPosition, labelVerticalAlign, labelBackground, labelFit, labelMaxWidth, labelMaxWidthTakeAvailableSpace, labelMaxWidthTakeAvailableSpaceTolerance, labelExpandTrimmedOnHover, labelTrimMode, labelFontSize, labelTextSeparator, labelTextDecoration, labelForceWordBreak, labelColor, labelCursor, labelVisibility, subLabelFontSize, subLabelColor, subLabelPlacement, subLabelTextDecoration, subLabelToLabelInlineWidthRatio, onZoom, selectedNodeIds } = this
    const config = { duration, events, attributes, id, heightNormalizationCoeff, zoomScale, zoomPan, enableZoom, zoomExtent, zoomMode, exitTransitionType, enterTransitionType, highlightSubtreeOnHover, highlightDuration, highlightDelay, iterations, nodeSort, linkSort, nodeWidth, nodeAlign, nodeHorizontalSpacing, nodeMinHeight, nodeMaxHeight, nodePadding, showSingleNode, nodeCursor, nodeIcon, nodeColor, nodeFixedValue, nodeIconColor, linkColor, linkValue, linkCursor, label, subLabel, labelPosition, labelVerticalAlign, labelBackground, labelFit, labelMaxWidth, labelMaxWidthTakeAvailableSpace, labelMaxWidthTakeAvailableSpaceTolerance, labelExpandTrimmedOnHover, labelTrimMode, labelFontSize, labelTextSeparator, labelTextDecoration, labelForceWordBreak, labelColor, labelCursor, labelVisibility, subLabelFontSize, subLabelColor, subLabelPlacement, subLabelTextDecoration, subLabelToLabelInlineWidthRatio, onZoom, selectedNodeIds }
    const keys = Object.keys(config) as (keyof SankeyConfigInterface<N, L>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
