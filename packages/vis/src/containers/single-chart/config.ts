// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Enums
import { Scales } from 'enums/scales'

export interface SingleChartConfigInterface extends ContainerConfigInterface {
  /** Visualization Component */
  component?: any;
  /** X scale configuration object */
  x?: {
    scale?: any;
    domain?: number[];
  };
  /** Y scale configuration object */
  y?: {
    scale?: any;
    domain?: number[];
  };
  /** Callback actions */
  action?: object;
  /** Tooltip component */
  tooltip?: Tooltip;
}

export class SingleChartConfig extends ContainerConfig implements SingleChartConfigInterface {
  tooltip = undefined
  x = {
    scale: Scales.scaleLinear(),
    domain: undefined,
  }

  y = {
    scale: Scales.scaleLinear(),
    domain: undefined,
  }
}
