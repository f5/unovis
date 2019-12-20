// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { XYCore } from 'core/xy-component'
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Enums
// import { Scales } from 'enums/scales'

// Types
import { Dimension } from 'utils/types'

export interface CompositeChartConfigInterface extends ContainerConfigInterface {
  /** Visualization Component */
  components?: XYCore[]
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension
  }
  /** Tooltip component */
  tooltip?: Tooltip;
}

export class CompositeChartConfig extends ContainerConfig implements CompositeChartConfigInterface {
  components? = []
  tooltip = undefined
  dimensions = {
    x: {},
    y: {},
  }
}
