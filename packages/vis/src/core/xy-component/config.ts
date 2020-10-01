// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'types/color'
import { Scale, ContiniousScale } from 'types/scales'
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
  id?: ((d: Datum, i?: number, ...any) => string | number);
  /** Component color (string or color object) */
  color?: string | any;
  /** Coloring type */
  colorType?: ColorType;
  scales?: {
    x?: ContiniousScale;
    y?: ContiniousScale;
  };
  /** Sets the Y scale domain based on the X scale domain not the whole data. Default: `false` */
  adaptiveYScale?: boolean;
  events?: {
    [selector: string]: {
      [eventName: string]: (data: Datum) => void;
    };
  };
}

export class XYComponentConfig<Datum> extends ComponentConfig implements XYComponentConfigInterface<Datum> {
  // eslint-disable-next-line dot-notation
  x = undefined; // NumericAccessor<Datum> = d => d['x'];
  // eslint-disable-next-line dot-notation
  y = undefined; // NumericAccessor<Datum> = d => d['y'];
  // eslint-disable-next-line dot-notation
  id = (d: Datum, i: number): string | number => d['id'] ?? i
  // eslint-disable-next-line dot-notation
  color = (d: Datum): string => d['color']
  colorType = ColorType.Static
  scales = {
    x: Scale.scaleLinear() as ContiniousScale,
    y: Scale.scaleLinear() as ContiniousScale,
  }

  adaptiveYScale = false
}
