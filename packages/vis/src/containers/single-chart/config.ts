// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Enums
// import { Scales } from 'enums/scales'

// Types
import { Dimension } from 'utils/types'

export interface SingleChartConfigInterface extends ContainerConfigInterface {
  /** Visualization Component */
  component?: any;
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Tooltip component */
  tooltip?: Tooltip;
}

export class SingleChartConfig extends ContainerConfig implements SingleChartConfigInterface {
  tooltip = undefined
  dimensions = {}
}
