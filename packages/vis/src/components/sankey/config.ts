// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/misc'
import { TrimMode } from 'types/text'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, LabelPosition, NodeAlignType } from 'types/sankey'
import { ExitTransitionType, EnterTransitionType } from 'types/animation'
import { Position } from 'types/position'

export interface SankeyConfigInterface<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfigInterface {
  // General
  /** Id accessor for better visual data updates */
  id?: ((d: SankeyNodeDatumInterface | SankeyLinkDatumInterface, i?: number, ...any) => string);
  /** Coefficient to scale the height of the diagram when the amount of links is low: C * links.length, clamped to [height / 2, height]  */
  heightNormalizationCoeff?: number;
  /** Type of animation on removing nodes */
  exitTransitionType?: ExitTransitionType;
  /** Type of animation on creating nodes */
  enterTransitionType?: EnterTransitionType;
  /** Highight the corresponding subtree on node / link hover. Default: false */
  highlightSubtreeOnHover?: boolean;
  /** Highlight animation duration, ms. Default: 400 */
  highlightDuration?: number;
  /** Highlight delay, ms. Default: 1000 */
  highlightDelay?: number;

  // Nodes
  /** Sankey node width in pixels */
  nodeWidth?: number;
  /** Sankey node alignment method */
  nodeAlign?: NodeAlignType;
  /** */
  nodeHorizontalSpacing?: number;
  /** */
  nodeMinHeight?: number;
  /** */
  nodeMaxHeight?: number;
  /** Sankey vertical separation between nodes in pixels */
  nodePadding?: number;
  /** Display the graph when data has just one element */
  showSingleNode?: boolean;
  /** Single node position */
  singleNodePosition?: Position.CENTER | Position.LEFT | string;
  /** Node cursor on hover */
  nodeCursor?: StringAccessor<L>;
  /** Node icon accessor function or value */
  nodeIcon?: StringAccessor<N>;
  /** Node color accessor function or value */
  nodeColor?: ColorAccessor<N>;
  /** Icon color accessor function or value */
  iconColor?: ColorAccessor<N>;

  // Links
  /** Node color accessor function or value */
  linkColor?: StringAccessor<L>;
  /** Link flow accessor function or value */
  linkValue?: NumericAccessor<N>;
  /** Node cursor on hover */
  linkCursor?: StringAccessor<L>;

  /** Node label accessor function or value */
  label?: StringAccessor<N>;
  /** Node sub-label accessor function or value */
  subLabel?: StringAccessor<N>;

  // Labels
  /** Display node labels even when there's not enough vertical space */
  forceShowLabels?: boolean;
  /** Label position relative to the Node */
  labelPosition?: LabelPosition;
  /** Maximum label with in pixels, default is 70 */
  labelWidth?: number;
  /** Maximum label length (in number characters) for wrapping */
  labelLength?: number;
  /** Label trimming mode */
  labelTrim?: TrimMode;
  /** Label font size in pixel, default is 13 */
  labelFontSize?: number;
  /** Label text separators for wrapping. Default: [' ', '-'] */
  labelTextSeparator?: string[];
  /** Force break words to fit long labels */
  labelForceWordBreak?: boolean;
  /** Label color */
  labelColor?: ColorAccessor<N>;
  /** Sub-label color */
  subLabelColor?: ColorAccessor<N>;

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
  subLabel = undefined
  labelPosition = LabelPosition.AUTO
  labelTextSeparator = [' ', '-']
  labelTrim = TrimMode.MIDDLE
  labelForceWordBreak = true
  labelFontSize = 12
  labelColor = null
  labelWidth = 70
  subLabelColor = null
  forceShowLabels = false

  // Links
  linkValue = (d: N): number => d['value']
  linkColor = (d: L): string => d['color']
  linkCursor = null
}
