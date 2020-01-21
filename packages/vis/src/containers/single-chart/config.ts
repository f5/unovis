// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Types
import { Dimension } from 'types/misc'
import { XYComponentCore } from 'core/xy-component'

export interface SingleChartConfigInterface<Datum> extends ContainerConfigInterface {
  /** Visualization Component */
  component?: XYComponentCore<Datum>;
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Tooltip component */
  tooltip?: Tooltip<XYComponentCore<Datum>, Datum>;
}

export class SingleChartConfig<Datum> extends ContainerConfig implements SingleChartConfigInterface<Datum> {
  tooltip = undefined
  dimensions = {}
}
