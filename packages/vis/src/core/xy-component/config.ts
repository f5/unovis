// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'types/color'
import { Scale, ScaleType } from 'types/scales'

// Types
import { NumericAccessor } from 'types/misc'

// Config
import { ComponentConfigInterface, ComponentConfig } from '../component/config'

export interface XYComponentConfigInterface<Datum> extends ComponentConfigInterface {
  /** X accessor or number value */
  x?: NumericAccessor<Datum>;
  /** Y accessor or value */
  y?: NumericAccessor<Datum> | NumericAccessor<Datum>[];
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
      [eventName: string]: (data: Datum) => void;
    };
  };
  // /** X scale type */
  // scales.xType?: ScaleType;
  // /** Y scale type */
  // scales.yType?: ScaleType;
}

export class XYComponentConfig<Datum> extends ComponentConfig implements XYComponentConfigInterface<Datum> {
  // eslint-disable-next-line dot-notation
  x: NumericAccessor<Datum> = d => d['x'];
  // eslint-disable-next-line dot-notation
  y: NumericAccessor<Datum> = d => d['y'];
  color = null
  colorType = ColorType.Static
  // scales.xType = ScaleType.Linear
  // scales.yType = ScaleType.Linear
  scales = {
    x: Scale.scaleLinear() as ScaleType,
    y: Scale.scaleLinear() as ScaleType,
  }
}
