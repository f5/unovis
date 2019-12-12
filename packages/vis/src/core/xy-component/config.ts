// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'utils/color'
// import { ScaleType } from 'enums/scales'

// Config
import { ComponentConfigInterface, ComponentConfig } from '../component/config'

export interface XYConfigInterface extends ComponentConfigInterface {
  //** X accessor or number value */
  x: ((d: any, i?: number, ...any) => number) | number;
  //** Y accessor or value */
  y: ((d: any, i?: number, ...any) => number) | number;
  /** Сomponent color (string or color object) */
  color?: string | object;
  /** Coloring tyle */
  colorType?: ColorType;
  // /** X scale Type */
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
