/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Sankey,
  SankeyConfigInterface,
  SankeyInputNode,
  SankeyInputLink,
  VisEventType,
  VisEventCallback,
  ExitTransitionType,
  EnterTransitionType,
  NodeAlignType,
  Position,
  StringAccessor,
  ColorAccessor,
  NumericAccessor,
  VerticalAlign,
  FitMode,
  TrimMode,
  SubLabelPlacement,
} from '@volterra/vis'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-sankey',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisSankeyComponent }],
})
export class VisSankeyComponent<N extends SankeyInputNode = SankeyInputNode, L extends SankeyInputLink = SankeyInputLink> implements SankeyConfigInterface<N, L>, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration: number

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
  @Input() events: {
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
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Node / Link id accessor function. Used for mapping of data updates to corresponding SVG objects. Default: `(d, i) => (d._id ?? i).toString()` */
  @Input() id: (d: SankeyInputNode | SankeyInputLink, i?: number, ...rest) => string

  /** Coefficient to scale the height of the diagram when the amount of links is low: `C * links.length`, clamped to `[height / 2, height]`. Default: `1/16` */
  @Input() heightNormalizationCoeff: number

  /** Type of animation on removing nodes. Default: `ExitTransitionType.Default` */
  @Input() exitTransitionType: ExitTransitionType

  /** Type of animation on creating nodes. Default: `EnterTransitionType.Default` */
  @Input() enterTransitionType: EnterTransitionType

  /** Highight the corresponding subtree on node / link hover. Default: `false` */
  @Input() highlightSubtreeOnHover: boolean

  /** Highlight animation duration, ms. Default: `400` */
  @Input() highlightDuration: number

  /** Highlight delay, ms. Default: `1000` */
  @Input() highlightDelay: number

  /** Sankey node sorting function. Default: `undefined`.
   * Node sorting is applied to nodes in one layer (column). Layer by layer.
   * Options: `undefined` - the order is determined by the layout;
   *          `null` - the order is fixed by the input;
   *          sort function - the order is determined by the function. */
  @Input() nodeSort: ((node1: N, node2: N) => number) | null | undefined

  /** Sankey link sorting function. Default: `(link2, link1) => link1.value - link2.value`.
   * Link sorting is applied to the source (exiting) links within one node.
   * Options: `undefined` - the order is determined by the layout;
   *          `null` - the order is fixed by the input;
   *          sort function - the order is determined by the function. */
  @Input() linkSort: ((link1: L, link2: L) => number) | null | undefined

  /** Sankey node width in pixels */
  @Input() nodeWidth: number

  /** Sankey node alignment method */
  @Input() nodeAlign: NodeAlignType

  /** Horizontal space between the nodes. Extended Sizing property only. Default: `150` */
  @Input() nodeHorizontalSpacing: number

  /** Minimum node height. Extended Sizing property only. Default: `20` */
  @Input() nodeMinHeight: number

  /** Maximum node height. Extended Sizing property only. Default: `100` */
  @Input() nodeMaxHeight: number

  /** Sankey vertical separation between nodes in pixels. Default: `2` */
  @Input() nodePadding: number

  /** Display the graph when data has just one element */
  @Input() showSingleNode: boolean

  /** Single node position. Default: `Position.CENTER` */
  @Input() singleNodePosition: Position.Center | Position.Left | string

  /** Node cursor on hover. Default: `null` */
  @Input() nodeCursor: StringAccessor<L>

  /** Node icon accessor function or value. Default: `null` */
  @Input() nodeIcon: StringAccessor<N>

  /** Node color accessor function or value. Default: `null` */
  @Input() nodeColor: ColorAccessor<N>

  /** Icon color accessor function or value. Default: `null` */
  @Input() iconColor: ColorAccessor<N>

  /** Link color accessor function or value. Default: `l => l.color` */
  @Input() linkColor: StringAccessor<L>

  /** Link flow accessor function or value. Default: `l => l.value` */
  @Input() linkValue: NumericAccessor<L>

  /** Link cursor on hover. Default: `null` */
  @Input() linkCursor: StringAccessor<L>

  /** Node label accessor function or value. Default: `n => n.label` */
  @Input() label: StringAccessor<N>

  /** Node sub-label accessor function or value. Default: `undefined` */
  @Input() subLabel: StringAccessor<N>

  /** Label position relative to the Node. Default: `Position.AUTO` */
  @Input() labelPosition: Position.Auto | Position.Left | Position.Right | string

  /** Label vertical alignment */
  @Input() labelVerticalAlign: VerticalAlign | string

  /** Label background */
  @Input() labelBackground: boolean

  /** Label fit mode (wrap or trim). Default: `FitMode.TRIM` * */
  @Input() labelFit: FitMode

  /** Maximum label with in pixels. Default: `70` */
  @Input() labelMaxWidth: number

  /** Expand trimmed label on hover. Default: `true` */
  @Input() labelExpandTrimmedOnHover: boolean

  /** Maximum label length (in characters number) for wrapping. Default: `undefined` */
  /** Label trimming mode. Default: `TrimMode.MIDDLE` */
  @Input() labelTrimMode: TrimMode

  /** Label font size in pixel. Default: `12` */
  @Input() labelFontSize: number

  /** Label text separators for wrapping. Default: `[' ', '-']` */
  @Input() labelTextSeparator: string[]

  /** Force break words to fit long labels. Default: `true` */
  @Input() labelForceWordBreak: boolean

  /** Label color.. Default: `null` */
  @Input() labelColor: ColorAccessor<N>

  /** Custom function to set the label visibility. Default: `undefined` */
  @Input() labelVisibility: ((d: N, bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  }, hovered: boolean) => boolean) | undefined

  /** Sub-label font size in pixel. Default: `10` */
  @Input() subLabelFontSize: number

  /** Sub-label color. Default: `null` */
  @Input() subLabelColor: ColorAccessor<N>

  /** Sub-label position. Default: `SubLabelPlacement.INLINE` */
  @Input() subLabelPlacement: SubLabelPlacement | string

  /** Sub-label to label width ration when SubLabelPlacement.INLINE is set. Default: `0.4` */
  @Input() subLabelToLabelInlineWidthRatio: number
  @Input() data: any

  component: Sankey<N, L> | undefined

  ngAfterViewInit (): void {
    this.component = new Sankey<N, L>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): SankeyConfigInterface<N, L> {
    const { duration, events, attributes, id, heightNormalizationCoeff, exitTransitionType, enterTransitionType, highlightSubtreeOnHover, highlightDuration, highlightDelay, nodeSort, linkSort, nodeWidth, nodeAlign, nodeHorizontalSpacing, nodeMinHeight, nodeMaxHeight, nodePadding, showSingleNode, singleNodePosition, nodeCursor, nodeIcon, nodeColor, iconColor, linkColor, linkValue, linkCursor, label, subLabel, labelPosition, labelVerticalAlign, labelBackground, labelFit, labelMaxWidth, labelExpandTrimmedOnHover, labelTrimMode, labelFontSize, labelTextSeparator, labelForceWordBreak, labelColor, labelVisibility, subLabelFontSize, subLabelColor, subLabelPlacement, subLabelToLabelInlineWidthRatio } = this
    const config = { duration, events, attributes, id, heightNormalizationCoeff, exitTransitionType, enterTransitionType, highlightSubtreeOnHover, highlightDuration, highlightDelay, nodeSort, linkSort, nodeWidth, nodeAlign, nodeHorizontalSpacing, nodeMinHeight, nodeMaxHeight, nodePadding, showSingleNode, singleNodePosition, nodeCursor, nodeIcon, nodeColor, iconColor, linkColor, linkValue, linkCursor, label, subLabel, labelPosition, labelVerticalAlign, labelBackground, labelFit, labelMaxWidth, labelExpandTrimmedOnHover, labelTrimMode, labelFontSize, labelTextSeparator, labelForceWordBreak, labelColor, labelVisibility, subLabelFontSize, subLabelColor, subLabelPlacement, subLabelToLabelInlineWidthRatio }
    const keys = Object.keys(config) as (keyof SankeyConfigInterface<N, L>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
