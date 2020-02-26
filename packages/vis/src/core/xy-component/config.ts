// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'types/color'
import { Scale, ScaleType } from 'types/scales'
// Types
import { NumericAccessor } from 'types/misc'
// Config
import { ComponentConfig, ComponentConfigInterface } from '../component/config'

export interface XYComponentConfigInterface<Datum> extends ComponentConfigInterface {
  /** X accessor or number value */
  x?: NumericAccessor<Datum>;
  /** Y accessor or value */
  y?: NumericAccessor<Datum> | NumericAccessor<Datum>[];
  /** Id accessor for better visual data updates */
  id?: ((d: Datum, i?: number, ...any) => string);
  /** Component color (string or color object) */
  color?: string | object;
  /** Coloring type */
  colorType?: ColorType;
  scales?: {
    x?: ScaleType;
    y?: ScaleType;
  };
  events?: {
    [selector: string]: {
      [eventName: string]: (data: {data: Datum}) => void;
    };
  };
  // /** X scale type */
  // scales.xType?: ScaleType;
  // /** Y scale type */
  // scales.yType?: ScaleType;
}

export class XYComponentConfig<Datum> extends ComponentConfig implements XYComponentConfigInterface<Datum> {
  // eslint-disable-next-line dot-notation
  x: undefined; // NumericAccessor<Datum> = d => d['x'];
  // eslint-disable-next-line dot-notation
  y: undefined; // NumericAccessor<Datum> = d => d['y'];
  // eslint-disable-next-line dot-notation
  id = (d: Datum, i: number): string => d['id'] ?? i
  // eslint-disable-next-line dot-notation
  color = (d: Datum): string => d['color']
  colorType = ColorType.Static
  // scales.xType = ScaleType.Linear
  // scales.yType = ScaleType.Linear
  scales = {
    x: Scale.scaleLinear() as ScaleType,
    y: Scale.scaleLinear() as ScaleType,
  }
}
