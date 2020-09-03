// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/misc'
import { TrimMode, VerticalAlign, FitMode } from 'types/text'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, NodeAlignType, SubLabelPlacement } from 'types/sankey'
import { ExitTransitionType, EnterTransitionType } from 'types/animation'
import { Position } from 'types/position'

export interface SankeyConfigInterface<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfigInterface {
  // General
  /** Node / Link id accessor function. Used for mapping of data updates to corresponding SVG objects. Default: `(d, i) => (d._id ?? i).toString()` */
  id?: (d: SankeyNodeDatumInterface | SankeyLinkDatumInterface, i?: number, ...any) => string;
  /** Coefficient to scale the height of the diagram when the amount of links is low: `C * links.length`, clamped to `[height / 2, height]`. Default: `1/16` */
  heightNormalizationCoeff?: number;
  /** Type of animation on removing nodes. Default: `ExitTransitionType.DEFAULT` */
  exitTransitionType?: ExitTransitionType;
  /** Type of animation on creating nodes. Default: `EnterTransitionType.DEFAULT` */
  enterTransitionType?: EnterTransitionType;
  /** Highight the corresponding subtree on node / link hover. Default: `false` */
  highlightSubtreeOnHover?: boolean;
  /** Highlight animation duration, ms. Default: `400` */
  highlightDuration?: number;
  /** Highlight delay, ms. Default: `1000` */
  highlightDelay?: number;

  // Sorting
  /** Sankey node sorting function. Default: `undefined`.
   *  Node sorting is applied to nodes in one layer (column). Layer by layer.
   *  Options: `undefined` - the order is determined by the layout;
   *           `null` - the order is fixed by the input;
   *           sort function - the order is determined by the function.
  */
  nodeSort?: ((node1: N, node2: N) => number) | null | undefined;
  /** Sankey link sorting function. Default: `(link2, link1) => link1.value - link2.value`.
   *  Link sorting is applied to the source (exiting) links within one node.
   *  Options: `undefined` - the order is determined by the layout;
   *           `null` - the order is fixed by the input;
   *           sort function - the order is determined by the function.
  */
  linkSort?: ((link1: L, link2: L) => number) | null | undefined;

  // Nodes
  /** Sankey node width in pixels */
  nodeWidth?: number;
  /** Sankey node alignment method */
  nodeAlign?: NodeAlignType;
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
  /** Single node position. Default: `Position.CENTER` */
  singleNodePosition?: Position.CENTER | Position.LEFT | string;
  /** Node cursor on hover. Default: `null` */
  nodeCursor?: StringAccessor<L>;
  /** Node icon accessor function or value. Default: `null` */
  nodeIcon?: StringAccessor<N>;
  /** Node color accessor function or value. Default: `null` */
  nodeColor?: ColorAccessor<N>;
  /** Icon color accessor function or value. Default: `null` */
  iconColor?: ColorAccessor<N>;

  // Links
  /** Link color accessor function or value. Default: `l => l.color` */
  linkColor?: StringAccessor<L>;
  /** Link flow accessor function or value. Default: `l => l.value` */
  linkValue?: NumericAccessor<N>;
  /** Link cursor on hover. Default: `null` */
  linkCursor?: StringAccessor<L>;

  // Labels
  /** Node label accessor function or value. Default: `n => n.label` */
  label?: StringAccessor<N>;
  /** Node sub-label accessor function or value. Default: `undefined` */
  subLabel?: StringAccessor<N>;
  /** Label position relative to the Node. Default: `Position.AUTO` */
  labelPosition?: Position.AUTO | Position.LEFT | Position.RIGHT | string;
  /** Label vertical alignment */
  labelVerticalAlign?: VerticalAlign | string;
  /** Label background */
  labelBackground?: boolean;
  /** Label fit mode (wrap or trim). Default: `FitMode.TRIM` **/
  labelFit?: FitMode;
  /** Maximum label with in pixels. Default: `70` */
  labelMaxWidth?: number;
  /** Expand trimmed label on hover. Default: `true` */
  labelExpandTrimmedOnHover?: boolean
  /** Maximum label length (in characters number) for wrapping. Default: `undefined` */
  // labelLength?: number;
  /** Label trimming mode. Default: `TrimMode.MIDDLE` */
  labelTrimMode?: TrimMode;
  /** Label font size in pixel. Default: `12` */
  labelFontSize?: number;
  /** Label text separators for wrapping. Default: `[' ', '-']` */
  labelTextSeparator?: string[];
  /** Force break words to fit long labels. Default: `true` */
  labelForceWordBreak?: boolean;
  /** Label color.. Default: `null` */
  labelColor?: ColorAccessor<N>;
  /** Custom function to set the label visibility. Default: `undefined` */
  labelVisibility?: ((d: N, bbox: { x: number; y: number; width: number; height: number }, hovered: boolean) => boolean) | undefined;
  /** Sub-label color. Default: `null` */
  subLabelColor?: ColorAccessor<N>;
  /** Sub-label position. Default: `SubLabelPlacement.INLINE` */
  subLabelPlacement?: SubLabelPlacement | string;
  /** Sub-label to label width ration when SubLabelPlacement.INLINE is set. Default: `0.4` */
  subLabelToLabelInlineWidthRatio?: number;
}

export class SankeyConfig<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfig implements SankeyConfigInterface<N, L> {
  // General
  heightNormalizationCoeff = 1 / 16
  exitTransitionType = ExitTransitionType.DEFAULT
  enterTransitionType = EnterTransitionType.DEFAULT
  // eslint-disable-next-line dot-notation
  id = (d: SankeyNodeDatumInterface | SankeyLinkDatumInterface, i: number): string => (d['_id'] ?? i).toString()
  highlightSubtreeOnHover = false
  highlightDuration = 400
  highlightDelay = 1000

  // Sorting
  linkSort = (link2: L, link1: L): number => link1.value - link2.value
  nodeSort = undefined

  // Nodes
  nodeWidth = 25
  nodeAlign = NodeAlignType.JUSTIFY
  nodeHorizontalSpacing = 150
  nodeMinHeight = 20
  nodeMaxHeight = 100
  nodePadding = 2
  nodeColor = (d: N): string => d['color']
  showSingleNode = true
  singleNodePosition = Position.CENTER
  nodeCursor = null
  nodeIcon = null
  iconColor = null

  // Labels
  label = (d: N): string => d['label']
  labelPosition = Position.AUTO
  labelVerticalAlign = VerticalAlign.MIDDLE
  labelBackground = false
  labelTextSeparator = [' ', '-']
  labelFit = FitMode.TRIM
  labelTrimMode = TrimMode.MIDDLE
  labelForceWordBreak = true
  labelFontSize = 12
  labelColor = null
  labelMaxWidth = 70
  labelExpandTrimmedOnHover = true;
  labelLength = undefined
  labelVisibility = undefined
  subLabel = undefined
  subLabelColor = null
  subLabelPlacement = SubLabelPlacement.BELOW
  subLabelToLabelInlineWidthRatio = 0.4

  // Links
  linkValue = (d: N): number => d['value']
  linkColor = (d: L): string => d['color']
  linkCursor = null
}
