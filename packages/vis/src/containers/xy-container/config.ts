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

export interface XYContainerConfigInterface<Data> extends ContainerConfigInterface {
  /** Visualization Component */
  components?: XYComponentCore<Data>[];
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Axis configuration */
  axes?: {
    [key: string]: Axis<Data>;
  };
  /** Enables automatic calculation of margins based on axes size */
  autoMargin?: boolean;
  /** Tooltip component */
  tooltip?: Tooltip<XYComponentCore<Data>, Data> | undefined;
}

export class XYContainerConfig<Data> extends ContainerConfig implements XYContainerConfigInterface<Data> {
  components? = []
  tooltip = undefined
  axes: { [key: string]: Axis<Data> } = {}
  autoMargin = true
  dimensions = {
    x: {} as Dimension,
    y: {} as Dimension,
  }
}
