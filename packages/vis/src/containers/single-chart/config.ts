// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Types
import { Dimension } from 'types/misc'
import { XYComponentCore } from 'core/xy-component'

export interface SingleChartConfigInterface<Data> extends ContainerConfigInterface {
  /** Visualization Component */
  component?: XYComponentCore<Data>;
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Tooltip component */
  tooltip?: Tooltip<XYComponentCore<Data>, Data>;
}

export class SingleChartConfig<Data> extends ContainerConfig implements SingleChartConfigInterface<Data> {
  tooltip = undefined
  dimensions = {}
}
