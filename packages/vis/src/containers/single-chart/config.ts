// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { ComponentCore } from 'core/component'
import { Tooltip } from 'core/tooltip'
import { GenericDataRecord } from 'types/data'

export interface SingleChartConfigInterface<Datum = GenericDataRecord> extends ContainerConfigInterface {
  /** Visualization component. Default: `undefined` */
  component?: ComponentCore<Datum>;
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip<ComponentCore<Datum>, Datum>;
}

export class SingleChartConfig<Datum = GenericDataRecord> extends ContainerConfig implements SingleChartConfigInterface<Datum> {
  tooltip = undefined
}
