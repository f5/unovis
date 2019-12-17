// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'utils/color'
// import { ScaleType } from 'enums/scales'

// Utils
import { numericAccessor } from 'utils/types'

// Config
import { ComponentConfigInterface, ComponentConfig } from '../component/config'

export interface XYConfigInterface extends ComponentConfigInterface {
  /** X accessor or number value */
  x: numericAccessor;
  /** Y accessor or value */
  y: numericAccessor | numericAccessor[];
  /** Component color (string or color object) */
  color?: string | object;
  /** Coloring type */
  colorType?: ColorType;
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
}
