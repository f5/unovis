// Copyright (c) Volterra, Inc. All rights reserved.
// import { scale } from 'd3-scale'

// Core
import { XYComponentCore } from 'core/xy-component'
import { ContainerConfig, ContainerConfigInterface } from 'core/container/config'
import { Tooltip } from 'core/tooltip'

// Components
import { Axis } from 'components/axis'
import { Crosshair } from 'components/crosshair'

// Types
import { Dimension } from 'types/misc'

export interface XYContainerConfigInterface<Datum> extends ContainerConfigInterface {
  /** Visualization Component */
  components?: XYComponentCore<Datum>[];
  /** Dimension configuration */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Axis configuration */
  axes?: {
    [key: string]: Axis<Datum>;
  };
  /** Enables automatic calculation of margins based on axes size */
  autoMargin?: boolean;
  /** Tooltip component */
  tooltip?: Tooltip<XYComponentCore<Datum>, Datum> | undefined;
  /** Crosshair component */
  crosshair?: Crosshair<Datum> | undefined;
}

export class XYContainerConfig<Datum> extends ContainerConfig implements XYContainerConfigInterface<Datum> {
  components = []
  tooltip = undefined
  crosshair = undefined
  axes: { [key: string]: Axis<Datum> } = {}
  autoMargin = true
  dimensions = {
    x: {} as Dimension,
    y: {} as Dimension,
  }
}
