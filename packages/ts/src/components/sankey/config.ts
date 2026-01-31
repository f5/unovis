import { D3ZoomEvent } from 'd3-zoom'

// Config
import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'

// Utils
import { getNumber } from 'utils/data'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { TrimMode, VerticalAlign, FitMode } from 'types/text'
import { Position } from 'types/position'
import { Spacing } from 'types/spacing'

import {
  SankeyInputLink,
  SankeyInputNode,
  SankeyNodeAlign,
  SankeySubLabelPlacement,
  SankeyExitTransitionType,
  SankeyEnterTransitionType,
  SankeyLink,
  SankeyNode,
  SankeyZoomMode,
} from './types'

export interface SankeyConfigInterface<N extends SankeyInputNode, L extends SankeyInputLink> extends ComponentConfigInterface {
  // General
  /** Node / Link id accessor function. Used for mapping of data updates to corresponding SVG objects. Default: `(d, i) => d.id ?? i.toString()` */
  id?: (d: SankeyInputNode | SankeyInputLink, i: number, ...any: unknown[]) => string;
  /** Coefficient to scale the height of the diagram when the amount of links is low: `C * links.length`, clamped to `[height / 2, height]`. Default: `1/16` */
  heightNormalizationCoeff?: number;
  /** Horizontal and vertical scale factor applied to the computed layout (column spacing). Keeps node width intact. Default: `undefined` */
  zoomScale?: [number, number];
  /** Pan offset in pixels. Default: `undefined` */
  zoomPan?: [number, number];
  /** Enable interactive zoom/pan behavior. Default: `true` */
  enableZoom?: boolean;
  /** Allowed interactive zoom scale extent. Default: `[1, 5]` */
  zoomExtent?: [number, number];
  /** Zoom interaction mode. Default: `SankeyZoomMode.XY` */
  zoomMode?: SankeyZoomMode | string;
  /** Type of animation on removing nodes. Default: `ExitTransitionType.Default` */
  exitTransitionType?: SankeyExitTransitionType;
  /** Type of animation on creating nodes. Default: `EnterTransitionType.Default` */
  enterTransitionType?: SankeyEnterTransitionType;
  /** Highlight the corresponding subtree on node / link hover. Default: `false` */
  highlightSubtreeOnHover?: boolean;
  /** Highlight animation duration, ms. Default: `400` */
  highlightDuration?: number;
  /** Highlight delay, ms. Default: `1000` */
  highlightDelay?: number;
  /** Sankey algorithm iterations. Default: `32` */
  iterations?: number;

  // Sorting
  /** Sankey node sorting function. Default: `undefined`.
   *  Node sorting is applied to nodes in one layer (column). Layer by layer.
   *  Options: `undefined` - the order is determined by the layout;
   *           `null` - the order is fixed by the input;
   *           sort function - the order is determined by the function.
  */
  nodeSort?: ((node1: SankeyNode<N, L>, node2: SankeyNode<N, L>) => number) | null | undefined;
  /** Sankey link sorting function. Default: `(link2, link1) => link1.value - link2.value`.
   *  Link sorting is applied to the source (exiting) links within one node.
   *  Options: `undefined` - the order is determined by the layout;
   *           `null` - the order is fixed by the input;
   *           sort function - the order is determined by the function.
  */
  linkSort?: ((link1: SankeyLink<N, L>, link2: SankeyLink<N, L>) => number) | null | undefined;

  // Nodes
  /** Sankey node width in pixels */
  nodeWidth?: number;
  /** Sankey node alignment method */
  nodeAlign?: SankeyNodeAlign;
  /** Horizontal space between the nodes. Extended Sizing property only. Default: `150` */
  nodeHorizontalSpacing?: number;
  /** Minimum node height. Extended Sizing property only. Default: `20` */
  nodeMinHeight?: number;
  /** Maximum node height. Extended Sizing property only. Default: `100` */
  nodeMaxHeight?: number;
  /** Sankey vertical separation between nodes in pixels. Default: `2` */
  nodePadding?: number;
  /** Display the graph when data has just one element */
  showSingleNode?: boolean;
  /** Node cursor on hover. Default: `undefined` */
  nodeCursor?: StringAccessor<SankeyNode<N, L>>;
  /** Node icon accessor function or value. Default: `undefined` */
  nodeIcon?: StringAccessor<SankeyNode<N, L>>;
  /** Node color accessor function or value. Default: `undefined` */
  nodeColor?: ColorAccessor<SankeyNode<N, L>>;
  /** Node `fixedValue` accessor function or constant. It defines the node value that will be used to calculate
   * the height of the nodes by d3-sankey (by default the height will be based on aggregated `linkValue`).
   * Default: `n => n.fixedValue`
  */
  nodeFixedValue?: NumericAccessor<N>;
  /** Icon color accessor function or value. Default: `undefined` */
  nodeIconColor?: ColorAccessor<SankeyNode<N, L>>;

  // Links
  /** Link color accessor function or value. Default: `l => l.color` */
  linkColor?: StringAccessor<SankeyLink<N, L>>;
  /** Link flow accessor function or value. Default: `l => l.value` */
  linkValue?: NumericAccessor<L>;
  /** Link cursor on hover. Default: `undefined` */
  linkCursor?: StringAccessor<SankeyLink<N, L>>;

  // Labels
  /** Node label accessor function or value. Default: `n => n.label` */
  label?: StringAccessor<SankeyNode<N, L>>;
  /** Node sub-label accessor function or value. Default: `undefined` */
  subLabel?: StringAccessor<SankeyNode<N, L>>;
  /** Label position relative to the Node. Default: `Position.AUTO` */
  labelPosition?: GenericAccessor<Position.Auto | Position.Left | Position.Right | string, SankeyNode<N, L>>;
  /** Label vertical alignment */
  labelVerticalAlign?: VerticalAlign | string;
  /** Label background */
  labelBackground?: boolean;
  /** Label fit mode (wrap or trim). Default: `FitMode.Trim` **/
  labelFit?: FitMode;
  /** Maximum label with in pixels. Default: `70` */
  labelMaxWidth?: number;
  /** Whether to take the available space for the label. This property is used only if `labelMaxWidth` is not provided. Default: `false` */
  labelMaxWidthTakeAvailableSpace?: boolean;
  /** Tolerance for the available space for the label. This property is used only if `labelMaxWidthTakeAvailableSpace` is `true`. Default: `undefined` (use label and sub-label font sizes) */
  labelMaxWidthTakeAvailableSpaceTolerance?: number;
  /** Expand trimmed label on hover. Default: `true` */
  labelExpandTrimmedOnHover?: boolean;
  /** Label trimming mode. Default: `TrimMode.Middle` */
  labelTrimMode?: TrimMode;
  /** Label font size in pixels. If not provided, the value of CSS variable `--vis-sankey-node-label-font-size` will be used. Default: `undefined` */
  labelFontSize?: number;
  /** Label text separators for wrapping. Default: `[' ', '-']` */
  labelTextSeparator?: string[];
  /** Label text decoration. Default: `undefined` */
  labelTextDecoration?: StringAccessor<SankeyNode<N, L>>;
  /** Force break words to fit long labels. Default: `true` */
  labelForceWordBreak?: boolean;
  /** Label color. Default: `undefined` */
  labelColor?: ColorAccessor<SankeyNode<N, L>>;
  /** Label cursor on hover. Default: `undefined` */
  labelCursor?: StringAccessor<SankeyNode<N, L>>;
  /** Custom function to set the label visibility. Default: `undefined` */
  labelVisibility?: ((d: SankeyNode<N, L>, bbox: { x: number; y: number; width: number; height: number }, hovered: boolean) => boolean) | undefined;
  /** Sub-label font size in pixels. If not provided, the value of CSS variable `--vis-sankey-node-sublabel-font-size` will be used. Default: `undefined` */
  subLabelFontSize?: number;
  /** Sub-label color. Default: `undefined` */
  subLabelColor?: ColorAccessor<SankeyNode<N, L>>;
  /** Sub-label position. Default: `SankeySubLabelPlacement.Below` */
  subLabelPlacement?: SankeySubLabelPlacement | string;
  /** Sub-label text decoration. Default: `undefined` */
  subLabelTextDecoration?: StringAccessor<SankeyNode<N, L>>;
  /**
   * Sub-label to label width ratio when `subLabelPlacement` is set to `SankeySubLabelPlacement.Inline`
   * Default: `0.4`, which means that 40% of `labelMaxWidth` will be given to sub-label, and 60% to the main label.
  */
  subLabelToLabelInlineWidthRatio?: number;

  // Events
  /** Zoom event callback. Default: `undefined` */
  onZoom?: (horizontalScale: number, verticalScale: number, panX: number, panY: number, zoomExtent: [number, number], event: D3ZoomEvent<SVGGElement, unknown> | undefined) => void;
  /** Callback function to be called when the graph layout is calculated. Default: `undefined` */
  onLayoutCalculated?: (nodes: SankeyNode<N, L>[], links: SankeyLink<N, L>[], depth: number, width: number, height: number, bleed: Spacing) => void;

  // Misc
  /** Set selected nodes by unique id. Default: `undefined` */
  selectedNodeIds?: string[];
}

export const SankeyDefaultConfig: SankeyConfigInterface<SankeyInputNode, SankeyInputLink> = ({
  ...ComponentDefaultConfig,
  heightNormalizationCoeff: 1 / 16,
  zoomScale: undefined,
  zoomPan: undefined,
  enableZoom: false,
  zoomExtent: [1, 5] as [number, number],
  zoomMode: SankeyZoomMode.Y,
  exitTransitionType: SankeyExitTransitionType.Default,
  enterTransitionType: SankeyEnterTransitionType.Default,
  id: (d: SankeyInputNode, i: number) => (d as { _id: string })._id ?? `${i}`,
  highlightSubtreeOnHover: false,
  highlightDuration: 300,
  highlightDelay: 1000,
  iterations: 32,
  nodeSort: undefined,
  nodeWidth: 25,
  nodeAlign: SankeyNodeAlign.Justify,
  nodeHorizontalSpacing: 150,
  nodeMinHeight: 20,
  nodeMaxHeight: 100,
  nodePadding: 2,
  nodeColor: (d: SankeyInputNode) => (d as { color: string }).color,
  nodeFixedValue: (d: SankeyInputNode) => (d as { fixedValue: number }).fixedValue,
  showSingleNode: true,
  nodeCursor: undefined,
  nodeIcon: undefined,
  nodeIconColor: undefined,
  label: (d: SankeyInputNode) => (d as { label: string }).label,
  labelPosition: Position.Auto,
  labelVerticalAlign: VerticalAlign.Middle,
  labelBackground: false,
  labelTextSeparator: [' ', '-'],
  labelTextDecoration: undefined,
  labelFit: FitMode.Trim,
  labelTrimMode: TrimMode.Middle,
  labelForceWordBreak: true,
  labelFontSize: undefined,
  labelCursor: undefined,
  labelColor: undefined,
  labelMaxWidth: undefined,
  labelMaxWidthTakeAvailableSpace: false,
  labelMaxWidthTakeAvailableSpaceTolerance: undefined,
  labelExpandTrimmedOnHover: true,
  labelVisibility: undefined,
  subLabel: undefined,
  subLabelFontSize: undefined,
  subLabelColor: undefined,
  subLabelPlacement: SankeySubLabelPlacement.Below,
  subLabelToLabelInlineWidthRatio: 0.4,
  subLabelTextDecoration: undefined,
  linkValue: (d: SankeyInputNode) => (d as { value: number }).value,
  linkColor: (d: SankeyInputNode) => (d as { color: string }).color,
  linkCursor: undefined,
  onZoom: undefined,
  onLayoutCalculated: undefined,
  selectedNodeIds: undefined,

  // https://stackoverflow.com/a/21648197/2040291
  init: function () {
    (this as SankeyConfigInterface<SankeyInputNode, SankeyInputLink>).linkSort =
      (link2, link1) => getNumber(link1, this.linkValue) - getNumber(link2, this.linkValue)
    delete this.init
    return this
  },
}).init()

