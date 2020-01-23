// Copyright (c) Volterra, Inc. All rights reserved.
// Config
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

export interface SankeyConfigInterface extends ComponentConfigInterface {
    /**  */
    nodeWidth?: number;
    /**  */
    nodePadding?: number;
    /**  */
    showSingleNode?: boolean;
    /**  */
    accessor?: {
      linkFlow?: string;
      linkWidth?: string;
      nodeWidth?: string;
      nodeLabel?: string;
      nodeIcon?: string;
      nodeColor?: string;
    };
    showLabels?: boolean;
    labelWidth?: number;
    labelLength?: number;
    labelTrim?: string;
    labelTextSeparator?: string[];
}

export class SankeyConfig extends ComponentConfig implements SankeyConfigInterface {
  nodeWidth = 15
  nodePadding = 2
  showSingleNode = false
  showLabels = false
  labelTextSeparator = [' ', '-']
  labelTrim = 'end'
  accessor = {
    linkFlow: 'flow',
  }
}
