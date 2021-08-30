// Copyright (c) Volterra, Inc. All rights reserved.
import { Scale, ContinuousScale } from 'types/scale'

// Types
import { ColorAccessor, NumericAccessor } from 'types/accessor'

// Config
import { ComponentConfig, ComponentConfigInterface } from '../component/config'

export interface XYComponentConfigInterface<Datum> extends ComponentConfigInterface {
  /** Accessor function for getting the values along the X axis. Default: `undefined` */
  x: NumericAccessor<Datum>;
  /** A single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  y: NumericAccessor<Datum> | NumericAccessor<Datum>[];
  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  id?: ((d: Datum, i?: number, ...any) => string);
  /** Component color accessor function. Default: `d => d.color` */
  color?: ColorAccessor<Datum | Datum[]>;
  /** X and Y scales. As of now, only continuous scales are supported. Default: `{ x: Scale.scaleLinear(), y: Scale.scaleLinear() } */
  scales?: {
    x?: ContinuousScale;
    y?: ContinuousScale;
  };
  /** Sets the Y scale domain based on the X scale domain not the whole data. Useful when you manipulate chart's X domain from outside. Default: `false` */
  scaleByDomain?: boolean;
}

export class XYComponentConfig<Datum> extends ComponentConfig implements XYComponentConfigInterface<Datum> {
  // eslint-disable-next-line dot-notation
  x = undefined; // NumericAccessor<Datum> = d => d['x'];
  // eslint-disable-next-line dot-notation
  y = undefined; // NumericAccessor<Datum> = d => d['y'];
  // eslint-disable-next-line dot-notation
  id = (d: Datum, i: number): string => d['id'] ?? `${i}`
  // eslint-disable-next-line dot-notation
  color = (d: Datum | Datum[]): string => d['color']
  scales = {
    x: Scale.scaleLinear() as ContinuousScale,
    y: Scale.scaleLinear() as ContinuousScale,
  }

  scaleByDomain = false
}
