/* eslint-disable dot-notation */

// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Utils
import { getNumber } from 'utils/data'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { TrimMode, VerticalAlign, FitMode } from 'types/text'
import { Position } from 'types/position'
import {
  SankeyInputLink,
  SankeyInputNode,
  SankeyNodeAlign,
  SankeySubLabelPlacement,
  SankeyExitTransitionType,
  SankeyEnterTransitionType,
} from './types'

export interface SankeyConfigInterface<N extends SankeyInputNode, L extends SankeyInputLink> extends ComponentConfigInterface {
  // General
  /** Node / Link id accessor function. Used for mapping of data updates to corresponding SVG objects. Default: `(d, i) => (d._id ?? i).toString()` */
  id?: (d: SankeyInputNode | SankeyInputLink, i?: number, ...any) => string;
  /** Coefficient to scale the height of the diagram when the amount of links is low: `C * links.length`, clamped to `[height / 2, height]`. Default: `1/16` */
  heightNormalizationCoeff?: number;
  /** Type of animation on removing nodes. Default: `ExitTransitionType.Default` */
  exitTransitionType?: SankeyExitTransitionType;
  /** Type of animation on creating nodes. Default: `EnterTransitionType.Default` */
  enterTransitionType?: SankeyEnterTransitionType;
  /** Highight the corresponding subtree on node / link hover. Default: `false` */
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
  nodeCursor?: StringAccessor<L>;
  /** Node icon accessor function or value. Default: `undefined` */
  nodeIcon?: StringAccessor<N>;
  /** Node color accessor function or value. Default: `undefined` */
  nodeColor?: ColorAccessor<N>;
  /** Node `fixedValue` accessor function or constant. It defines the node value that will be used to calculate
   * the height of the nodes by d3-sankey (by default the height will be based on aggregated `linkValue`).
   * Default: `n => n.fixedValue`
  */
  nodeFixedValue?: NumericAccessor<N>;
  /** Icon color accessor function or value. Default: `undefined` */
  iconColor?: ColorAccessor<N>;

  // Links
  /** Link color accessor function or value. Default: `l => l.color` */
  linkColor?: StringAccessor<L>;
  /** Link flow accessor function or value. Default: `l => l.value` */
  linkValue?: NumericAccessor<L>;
  /** Link cursor on hover. Default: `undefined` */
  linkCursor?: StringAccessor<L>;

  // Labels
  /** Node label accessor function or value. Default: `n => n.label` */
  label?: StringAccessor<N>;
  /** Node sub-label accessor function or value. Default: `undefined` */
  subLabel?: StringAccessor<N>;
  /** Label position relative to the Node. Default: `Position.AUTO` */
  labelPosition?: GenericAccessor<Position.Auto | Position.Left | Position.Right | string, N>;
  /** Label vertical alignment */
  labelVerticalAlign?: VerticalAlign | string;
  /** Label background */
  labelBackground?: boolean;
  /** Label fit mode (wrap or trim). Default: `FitMode.TRIM` **/
  labelFit?: FitMode;
  /** Maximum label with in pixels. Default: `70` */
  labelMaxWidth?: number;
  /** Expand trimmed label on hover. Default: `true` */
  labelExpandTrimmedOnHover?: boolean;
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
  /** Label color. Default: `undefined` */
  labelColor?: ColorAccessor<N>;
  /** Label cursor on hover. Default: `undefined` */
  labelCursor?: StringAccessor<L>;
  /** Custom function to set the label visibility. Default: `undefined` */
  labelVisibility?: ((d: N, bbox: { x: number; y: number; width: number; height: number }, hovered: boolean) => boolean) | undefined;
  /** Sub-label font size in pixel. Default: `10` */
  subLabelFontSize?: number;
  /** Sub-label color. Default: `undefined` */
  subLabelColor?: ColorAccessor<N>;
  /** Sub-label position. Default: `SankeySubLabelPlacement.Inline` */
  subLabelPlacement?: SankeySubLabelPlacement | string;
  /** Sub-label to label width ration when `subLabelPlacement` is set to `SankeySubLabelPlacement.Inline`. Default: `0.4` */
  subLabelToLabelInlineWidthRatio?: number;
}

export class SankeyConfig<N extends SankeyInputNode, L extends SankeyInputLink> extends ComponentConfig implements SankeyConfigInterface<N, L> {
  // General
  heightNormalizationCoeff = 1 / 16
  exitTransitionType = SankeyExitTransitionType.Default
  enterTransitionType = SankeyEnterTransitionType.Default
  // eslint-disable-next-line dot-notation
  id = (d: SankeyInputNode | SankeyInputLink, i: number): string => (d['_id'] ?? i).toString()
  highlightSubtreeOnHover = false
  highlightDuration = 300
  highlightDelay = 1000
  iterations = 32

  // Sorting
  linkSort = (link2: L, link1: L): number => getNumber(link1, this.linkValue) - getNumber(link2, this.linkValue)
  nodeSort = undefined

  // Nodes
  nodeWidth = 25
  nodeAlign = SankeyNodeAlign.Justify
  nodeHorizontalSpacing = 150
  nodeMinHeight = 20
  nodeMaxHeight = 100
  nodePadding = 2
  nodeColor = (d: N): string => d['color']
  nodeFixedValue = (d: N): number => d['fixedValue']
  showSingleNode = true
  nodeCursor = undefined
  nodeIcon = undefined
  iconColor = undefined

  // Labels
  label = (d: N): string => d['label']
  labelPosition = Position.Auto
  labelVerticalAlign = VerticalAlign.Middle
  labelBackground = false
  labelTextSeparator = [' ', '-']
  labelFit = FitMode.Trim
  labelTrimMode = TrimMode.Middle
  labelForceWordBreak = true
  labelFontSize = 12
  labelCursor = undefined
  labelColor = undefined
  labelMaxWidth = 70
  labelExpandTrimmedOnHover = true;
  labelLength = undefined
  labelVisibility = undefined
  subLabel = undefined
  subLabelFontSize = 10
  subLabelColor = undefined
  subLabelPlacement = SankeySubLabelPlacement.Below
  subLabelToLabelInlineWidthRatio = 0.4

  // Links
  linkValue = (d: L): number => d['value']
  linkColor = (d: L): string => d['color']
  linkCursor = undefined
}
