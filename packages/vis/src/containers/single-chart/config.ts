// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'

export interface SingleChartConfigInterface extends ContainerConfigInterface {
  /** Visualization Component */
  component?: any;
  /** X scale configuration object */
  x?: any;
  /** Y scale configuration object */
  y?: any;
  /** Callback actions */
  action?: object;
}

export class SingleChartConfig extends ContainerConfig implements SingleChartConfigInterface {
}
