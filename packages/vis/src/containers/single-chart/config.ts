// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { ComponentCore } from 'core/component'
import { Tooltip } from 'components/tooltip'

export interface SingleChartConfigInterface<Datum> extends ContainerConfigInterface {
  /** Visualization component. Default: `undefined` */
  component?: ComponentCore<Datum>;
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip;
}

export class SingleChartConfig<Datum> extends ContainerConfig implements SingleChartConfigInterface<Datum> {
  tooltip = undefined
}
