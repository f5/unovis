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
    /** Show or hide a single node */
    showSingleNode?: boolean;
    /** Node color accessor function or value */
    linkColor?: StringAccessor<L>;
    /** Link flow accessor function or value */
    linkFlow?: NumericAccessor<N>;
    /** Link width accessor function or value */
    linkWidth?: NumericAccessor<N>;
    /** Node label accessor function or value */
    nodeLabel?: StringAccessor<N>;
    /** Node icon accessor function or value */
    nodeIcon?: StringAccessor<N>;
    /** Node color accessor function or value */
    nodeColor?: ColorAccessor<L>;
    /** Icon color accessor function or value */
    iconColor?: ColorAccessor<N>;
    /** Show or hide node labels */
    showLabels?: boolean;
    /** Possible width to wrap label in pixels */
    labelWidth?: number;
    /** Possible length to wrap label in characters */
    labelLength?: number;
    /** Type of trim label */
    labelTrim?: TrimMode;
    /** Label text separators */
    labelTextSeparator?: string[];
    /** Force break words */
    labelForceWordBreak?: boolean;
}

export class SankeyConfig<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> extends ComponentConfig implements SankeyConfigInterface<N, L> {
  nodeWidth = 15
  nodePadding = 2
  showSingleNode = false
  showLabels = false
  labelTextSeparator = [' ', '-']
  labelTrim = TrimMode.END
  labelForceWordBreak = false
  linkFlow = (d: N): number => d['flow']
  linkColor = null
  linkWidth = null
  nodeLabel = null
  nodeIcon = null
  nodeColor = null
  iconColor = null
}
