// Core
import { XYComponentCore } from 'core/xy-component'
import { ContainerDefaultConfig, ContainerConfigInterface } from 'core/container/config'

// Components
import { Annotations } from 'components/annotations'
import { Tooltip } from 'components/tooltip'
import { Axis } from 'components/axis'
import { Crosshair } from 'components/crosshair'

// Types
import { ContinuousScale } from 'types/scale'
import { Direction } from 'types/direction'

export interface XYContainerConfigInterface<Datum> extends ContainerConfigInterface {
  /** An array of visualization components. Default: `[]` */
  components?: XYComponentCore<Datum>[];

  /** Scale for X dimension, e.g. Scale.scaleLinear().
   * If set, this value will override the components' xScale and they will have a single shared xScale instance.
   * By default the components have their own scale instances but their `domain` and `range` values are synchronized.
   * Default: `undefined` */
  xScale?: ContinuousScale;
  /** Scale domain (data extent) for X dimension. By default this value is calculated automatically based on data. */
  xDomain?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the X scale domain. Useful when the data is plotted along the X axis.
   * For example, imagine that you have a chart with dynamic data that has negative values. When values are small
   * (let's say in the range of [-0.01, 0]), you might still want the chart to display some meaningful value range (e.g. [-1, 0]). That can
   * be achieved by setting `xDomainMinConstraint` to `[undefined, -1]`. In addition to that, if you want to cut off the
   * values that are too low (let's say lower than -100), you can set the constraint to `[-100, -1]`
   * Default: `undefined` */
  xDomainMinConstraint?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the X scale domain. Useful when the data is plotted along the X axis.
   * For example, imagine that you have a chart with dynamic data. When values are small
   * (let's say < 0.01), you might still want the chart to display some meaningful value range (e.g. [0, 1]). That can
   * be achieved by setting `xDomainMaxConstraint` to `[1, undefined]`. In addition to that, if you want to cut off the
   * values that are too high (let's say higher than 100), you can set the constraint to `[1, 100]`
   * Default: `undefined` */
  xDomainMaxConstraint?: [number | undefined, number | undefined];
  /** Force set the X scale range (in the screen space). By default the range is calculated automatically based on the
   * chart's set up */
  xRange?: [number, number];

  /** Scale for Y dimension, e.g. Scale.scaleLinear().
   * If set, this value will override the components' yScale and they will have a single shared yScale instance.
   * By default the components have their own scale instances but their `domain` and `range` values are synchronized.
   * Default: `undefined` */
  yScale?: ContinuousScale;
  /** Scale domain (data extent) for Y dimension. By default this value is calculated automatically based on data. */
  yDomain?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the Y scale domain.
   * For example, imagine that you have a chart with dynamic data that has negative values. When values are small
   * (let's say in the range of [-0.01, 0]), you might still want the chart to display some meaningful value range (e.g. [-1, 0]). That can
   * be achieved by setting `yDomainMinConstraint` to `[undefined, -1]`. In addition to that, if you want to cut off the
   * values that are too low (let's say lower than -100), you can set the constraint to `[-100, -1]`
   * Default: `undefined` */
  yDomainMinConstraint?: [number | undefined, number | undefined];
  /** Constraint the minimum value of the Y scale domain.
   * For example, imagine that you have a chart with dynamic data. When values are small
   * (let's say < 0.01), you might still want the chart to display some meaningful value range (e.g. [0, 1]). That can
   * be achieved by setting `yDomainMaxConstraint` to `[1, undefined]`. In addition to that, if you want to cut off the
   * values that are too high (let's say higher than 100), you can set the constraint to `[1, 100]`
   * Default: `undefined` */
  yDomainMaxConstraint?: [number | undefined, number | undefined];
  /** Force set the Y scale range (in the screen space). By default the range is calculated automatically based on the
   * chart's set up */
  yRange?: [number, number];
  /** Y Axis direction. Default: `Direction.North` */
  yDirection?: Direction.South | Direction.North | string;

  /** X Axis component instance. Default: `undefined` */
  xAxis?: Axis<Datum>;
  /** Y Axis component instance. Default: `undefined` */
  yAxis?: Axis<Datum>;
  /** Enables automatic calculation of chart margins based on the size of the axes. Default: `true` */
  autoMargin?: boolean;
  /** Tooltip component. Default: `undefined` */
  tooltip?: Tooltip | undefined;
  /** Crosshair component. Default: `undefined` */
  crosshair?: Crosshair<Datum> | undefined;
  /** Prevents the chart domain from being empty (when domain's min and max values are equal).
   *  That usually happens when all the data values are equal or when there's no data.
   *  Setting to `true` will automatically extend the domain by `+1` when the domain is empty (domain start equals domain end).
   *  Setting to `null` will extend the empty X domain, but only when there's no data.
   *  Setting to `false` will keep the domain as is.
   *  Default: `null` */
  preventEmptyDomain?: boolean | null;
  /** Sets the Y scale domain based on the current X scale domain (not the whole dataset). Default: `false` */
  scaleByDomain?: boolean;
  /** Annotations component. Default: `undefined` */
  annotations?: Annotations | undefined;
  /** Extend the clip path by the specified number of pixels. Default: `2` */
  clipPathExtend?: number;
}


export const XYContainerDefaultConfig: XYContainerConfigInterface<unknown> = {
  ...ContainerDefaultConfig,
  components: [],
  tooltip: undefined,
  crosshair: undefined,
  annotations: undefined,
  xAxis: undefined,
  yAxis: undefined,
  autoMargin: true,

  xScale: undefined,
  xDomain: undefined,
  xDomainMinConstraint: undefined,
  xDomainMaxConstraint: undefined,
  xRange: undefined,

  yScale: undefined,
  yDomain: undefined,
  yDomainMinConstraint: undefined,
  yDomainMaxConstraint: undefined,
  yRange: undefined,
  yDirection: Direction.North,

  preventEmptyDomain: null,
  scaleByDomain: false,

  clipPathExtend: 2,
}

