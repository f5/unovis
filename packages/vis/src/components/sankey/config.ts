// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/misc'
import { TrimMode } from 'types/text'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface, LabelPosition, NodeAlignType } from 'types/sankey'
import { Sizing } from 'types/component'
import { ExitTransitionType, EnterTransitionType } from 'types/animation'
import { Position } from 'types/position'

export interface SankeyConfigInterface<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfigInterface {
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
    /** Node color accessor function or value */
    linkColor?: StringAccessor<L>;
    /** Link flow accessor function or value */
    linkValue?: NumericAccessor<N>;
    /** Node label accessor function or value */
    nodeLabel?: StringAccessor<N>;
    /** Node label accessor function or value */
    nodeSubLabel?: StringAccessor<N>;
    /** Node icon accessor function or value */
    nodeIcon?: StringAccessor<N>;
    /** Node color accessor function or value */
    nodeColor?: ColorAccessor<N>;
    /** Icon color accessor function or value */
    iconColor?: ColorAccessor<N>;
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
    /** Coefficient to scale the height of the diagram when the amount of links is low: C * links.length, clamped to [height / 2, height]  */
    heightNormalizationCoeff?: number;
    /** Id accessor for better visual data updates */
    id?: ((d: SankeyNodeDatumInterface | SankeyLinkDatumInterface, i?: number, ...any) => string);
    /** */
    sizing?: Sizing;
    /** Type of animation on removing nodes  */
    exitTransitionType?: ExitTransitionType;
    /** Type of animation on creating nodes  */
    enterTransitionType?: EnterTransitionType;
    /** Single node position */
    singleNodePosition?: Position.CENTER | Position.LEFT | string;
}

export class SankeyConfig<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfig implements SankeyConfigInterface<N, L> {
  nodeWidth = 25
  nodeAlign = NodeAlignType.JUSTIFY
  nodeHorizontalSpacing = 150
  nodeMinHeight = 30
  nodeMaxHeight = 100
  nodePadding = 2
  showSingleNode = true
  forceShowLabels = false
  labelPosition = LabelPosition.AUTO
  labelTextSeparator = [' ', '-']
  labelTrim = TrimMode.END
  labelForceWordBreak = false
  labelFontSize = 12
  linkValue = (d: N): number => d['value']
  linkColor = (d: L): string => d['color']
  nodeColor = (d: N): string => d['color']
  nodeLabel = (d: N): string => d['label']
  nodeSubLabel = undefined
  nodeIcon = null
  iconColor = null
  labelWidth = 70
  heightNormalizationCoeff = 1 / 16
  // eslint-disable-next-line dot-notation
  id = (d: SankeyNodeDatumInterface | SankeyLinkDatumInterface, i: number): string => (d['_id'] ?? i).toString()
  sizing = Sizing.FIT
  exitTransitionType = ExitTransitionType.DEFAULT
  enterTransitionType = EnterTransitionType.DEFAULT
  singleNodePosition = Position.CENTER
}
