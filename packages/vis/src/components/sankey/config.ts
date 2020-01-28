// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/misc'
import { TrimMode } from 'types/text'
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface } from './modules/types'

export interface SankeyConfigInterface<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfigInterface {
    /** Sankey node width in pixels */
    nodeWidth?: number;
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
    /** Node icon accessor function or value */
    nodeIcon?: StringAccessor<N>;
    /** Node color accessor function or value */
    nodeColor?: ColorAccessor<N>;
    /** Icon color accessor function or value */
    iconColor?: ColorAccessor<N>;
    /** Display node labels even when there's not enough vertical space */
    forceShowLabels?: boolean;
    /** Possible width to wrap label in pixels */
    labelWidth?: number;
    /** Maximum label length (in number characters) for wrapping */
    labelLength?: number;
    /** Label trimming mode */
    labelTrim?: TrimMode;
    /** Label text separators for wrapping. Default: [' ', '-'] */
    labelTextSeparator?: string[];
    /** Force break words to fit long labels */
    labelForceWordBreak?: boolean;
}

export class SankeyConfig<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfig implements SankeyConfigInterface<N, L> {
  nodeWidth = 25
  nodePadding = 2
  showSingleNode = true
  forceShowLabels = false
  labelTextSeparator = [' ', '-']
  labelTrim = TrimMode.END
  labelForceWordBreak = false
  linkValue = (d: N): number => d['value']
  linkColor = (d: L): string => d['color']
  nodeColor = (d: N): string => d['color']
  nodeLabel = null
  nodeIcon = null
  iconColor = null
}
