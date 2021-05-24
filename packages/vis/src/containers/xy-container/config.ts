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
  /** Visualization Component. Default: `[]` */
  components?: XYComponentCore<Datum>[];
  /** Dimension configuration. Default: `{x: {}, y: {}}` */
  dimensions?: {
    [key: string]: Dimension;
  };
  /** Axis configuration. Default: `{}` */
  axes?: {
    [key: string]: Axis<Datum>;
  };
  /** Enables automatic calculation of chart margins based on the size of the axes. Default: `true` */
  autoMargin?: boolean;
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip<XYComponentCore<Datum>, Datum> | undefined;
  /** Crosshair component. Default: `undefined` */
  crosshair?: Crosshair<Datum> | undefined;
  /** Prevents the chart domain from being empty (when domain's min and max values are equal).
   *  That usually happens when all the data values are the same.
   *  Setting to `true` will automatically extend the domain by `+1` when needed. Default: `true`
  */
  preventEmptyDomain?: boolean;
  /** Sets the Y scale domain based on the X scale domain not the whole data. Default: `false` */
  adaptiveYScale?: boolean;
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

  preventEmptyDomain = true
  adaptiveYScale = false
}
