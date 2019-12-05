// Copyright (c) Volterra, Inc. All rights reserved.
import { ColorType } from 'utils/color'
import { ScaleType } from 'enums/scales'

// Config
import { ComponentConfigInterface, ComponentConfig } from '../component/config'

export interface XYConfigInterface extends ComponentConfigInterface {
  x: ((d: any, i?: number, ...any) => number) | number;
  y: ((d: any, i?: number, ...any) => number) | number;
  /** component color */
  color?: string | object;
  colorType?: ColorType;
  xScaleType?: ScaleType;
  yScaleType?: ScaleType;
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export class XYConfig extends ComponentConfig implements XYConfigInterface {
  x = d => d.x
  y = d => d.y
  color = '#000'
  colorType = ColorType.Static
  xScaleType = ScaleType.Linear
  yScaleType = ScaleType.Linear
  padding = {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
  }
}
