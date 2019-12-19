// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'utils/color'
import { Scales, Scale } from 'enums/scales'

// Utils
import { NumericAccessor } from 'utils/types'

// Config
import { ComponentConfigInterface, ComponentConfig } from '../component/config'

export interface XYConfigInterface extends ComponentConfigInterface {
  /** X accessor or number value */
  x: NumericAccessor;
  /** Y accessor or value */
  y: NumericAccessor | NumericAccessor[];
  /** Component color (string or color object) */
  color?: string | object;
  /** Coloring type */
  colorType?: ColorType;
  xScale?: Scale;
  yScale?: Scale;
  // /** X scale type */
  // xScaleType?: ScaleType;
  // /** Y scale type */
  // yScaleType?: ScaleType;
}

export class XYConfig extends ComponentConfig implements XYConfigInterface {
  x = d => d.x
  y = d => d.y
  color = null
  colorType = ColorType.Static
  // xScaleType = ScaleType.Linear
  // yScaleType = ScaleType.Linear
  xScale = Scales.scaleLinear()
  yScale = Scales.scaleLinear()
}
