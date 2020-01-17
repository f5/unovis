// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'types/color'
import { Scale, ScaleType } from 'types/scales'

// Types
import { NumericAccessor } from 'types/misc'

// Config
import { ComponentConfigInterface, ComponentConfig } from '../component/config'

export interface XYComponentConfigInterface<Data> extends ComponentConfigInterface {
  /** X accessor or number value */
  x?: NumericAccessor<Data>;
  /** Y accessor or value */
  y?: NumericAccessor<Data> | NumericAccessor<Data>[];
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
      [eventName: string]: (data: Data) => void;
    };
  };
  // /** X scale type */
  // scales.xType?: ScaleType;
  // /** Y scale type */
  // scales.yType?: ScaleType;
}

export class XYComponentConfig<Data> extends ComponentConfig implements XYComponentConfigInterface<Data> {
  x = d => d.x
  y = d => d.y
  color = null
  colorType = ColorType.Static
  // scales.xType = ScaleType.Linear
  // scales.yType = ScaleType.Linear
  scales = {
    x: Scale.scaleLinear() as ScaleType,
    y: Scale.scaleLinear() as ScaleType,
  }
}
