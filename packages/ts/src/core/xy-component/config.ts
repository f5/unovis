import { ContinuousScale } from '@/types/scale'

// Types
import { ColorAccessor, NumericAccessor } from '@/types/accessor'

// Config
import { ComponentDefaultConfig, ComponentConfigInterface } from '../component/config'

export interface XYComponentConfigInterface<Datum> extends ComponentConfigInterface {
  /** Accessor function for getting the values along the X axis. Default: `undefined` */
  x: NumericAccessor<Datum>;
  /** A single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  id?: ((d: Datum, i: number, ...any: any[]) => string);
  /** Component color accessor function. Default: `d => d.color` */
  color?: ColorAccessor<Datum> | ColorAccessor<Datum[]>;
  /** Scale for X dimension, e.g. Scale.scaleLinear(). If you set xScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined`
  */
  xScale?: ContinuousScale;
  /** Scale for Y dimension, e.g. Scale.scaleLinear(). If you set yScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined`
  */
  yScale?: ContinuousScale;
  /** Identifies whether the component should be excluded from overall X and Y domain calculations or not.
   * This property can be useful when you want pass individual data to a component and you don't want it to affect
   * the scales of the chart.
   * Default: `false`
  */
  excludeFromDomainCalculation?: boolean;
}

export const XYComponentDefaultConfig: XYComponentConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  x: undefined,
  y: undefined,
  id: (d: unknown, i: number): string => (d as { id: string }).id ?? `${i}`,
  color: (d: unknown | unknown[]): string => (d as { color: string }).color,
  xScale: undefined,
  yScale: undefined,
  excludeFromDomainCalculation: false,
}
