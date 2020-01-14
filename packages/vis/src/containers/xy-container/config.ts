// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { XYComponentCore } from 'core/xy-component'
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Components
import { Axis } from 'components/axis'

// Types
import { Dimension } from 'types/misc'

export interface XYContainerConfigInterface extends ContainerConfigInterface {
  /** Visualization Component */
  components?: XYComponentCore[];
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Axis configuration */
  axes?: {
    [key: string]: Axis;
  };
  /** Enables automatic calculation of margins based on axes size */
  autoMargin?: boolean;
  /** Tooltip component */
  tooltip?: Tooltip<any> | undefined;
}

export class XYContainerConfig extends ContainerConfig implements XYContainerConfigInterface {
  components? = []
  tooltip = undefined
  axes: { [key: string]: Axis } = {}
  autoMargin = true
  dimensions = {
    x: {} as Dimension,
    y: {} as Dimension,
  }
}
