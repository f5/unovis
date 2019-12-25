// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'utils/color'
import { Scales, Scale } from 'enums/scales'

// Utils
import { NumericAccessor } from 'utils/types'

// Config
import { ComponentConfigInterface, ComponentConfig } from '../component/config'

export interface XYConfigInterface extends ComponentConfigInterface {
  /** X accessor or number value */
  x?: NumericAccessor;
  /** Y accessor or value */
  y?: NumericAccessor | NumericAccessor[];
  /** Component color (string or color object) */
  color?: string | object;
  /** Coloring type */
  colorType?: ColorType;
  scales?: {
    x?: Scale;
    y?: Scale;
  };
  // /** X scale type */
  // scales.xType?: ScaleType;
  // /** Y scale type */
  // scales.yType?: ScaleType;
}

export class XYConfig extends ComponentConfig implements XYConfigInterface {
  x = d => d.x
  y = d => d.y
  color = null
  colorType = ColorType.Static
  // scales.xType = ScaleType.Linear
  // scales.yType = ScaleType.Linear
  scales = {
    x: Scales.scaleLinear() as Scale,
    y: Scales.scaleLinear() as Scale,
  }
}
