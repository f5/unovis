// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { ComponentCore } from 'core/component'
import { Tooltip } from 'core/tooltip'

// Types
import { Dimension } from 'types/dimension'

export interface SingleChartConfigInterface<Datum> extends ContainerConfigInterface {
  /** Visualization Component */
  component?: ComponentCore<Datum>;
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Tooltip component */
  tooltip?: Tooltip<ComponentCore<Datum>, Datum>;
}

export class SingleChartConfig<Datum> extends ContainerConfig implements SingleChartConfigInterface<Datum> {
  tooltip = undefined
  dimensions = {}
}
