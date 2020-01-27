// Copyright (c) Volterra, Inc. All rights reserved.
// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { TrimMode } from 'types/text'

export interface SankeyConfigInterface extends ComponentConfigInterface {
    /** Sankey node width in pixels */
    nodeWidth?: number;
    /** Sankey vertical separation between nodes in pixels */
    nodePadding?: number;
    /** Show or hide a single node */
    showSingleNode?: boolean;
    /** Accessor to link flow */
    linkFlow?: (d: any) => number;
    /** Accessor to link width */
    linkWidth?: (d: any) => number;
    /** Accessor to node label */
    nodeLabel?: (d: any) => string;
    /** Accessor to node icon */
    nodeIcon?: (d: any) => string;
    /** Accessor to node color */
    nodeColor?: (d: any) => string;
    /** Accessor to icon color */
    iconColor?: (d: any) => string;
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

export class SankeyConfig extends ComponentConfig implements SankeyConfigInterface {
  nodeWidth = 15
  nodePadding = 2
  showSingleNode = false
  showLabels = false
  labelTextSeparator = [' ', '-']
  labelTrim = TrimMode.END
  labelForceWordBreak = false
  linkFlow = (d: any): number => d.flow
}
