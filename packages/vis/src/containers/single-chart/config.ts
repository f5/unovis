// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Types
import { Dimension } from 'types/misc'

export interface SingleChartConfigInterface extends ContainerConfigInterface {
  /** Visualization Component */
  component?: any;
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Tooltip component */
  tooltip?: Tooltip<any>;
}

export class SingleChartConfig extends ContainerConfig implements SingleChartConfigInterface {
  tooltip = undefined
  dimensions = {}
}
