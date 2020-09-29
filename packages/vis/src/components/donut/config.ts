// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor } from 'types/misc'

export interface DonutConfigInterface<Datum> extends ComponentConfigInterface {
  /** Value accessor function. Default: `undefined` */
  value: NumericAccessor<Datum>;
  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /** Pad angle. Default: `0` */
  padAngle?: number;
  /** Custom sort function. Default: `undefined` */
  sortFunction?: (a: Datum, b: Datum) => number;
  /** Corner Radius. Default: `0` */
  cornerRadius?: number;
  /** Color accessor function. Default: `undefined` */
  color?: ColorAccessor<Datum>;
  /** Explicitly set the donut outer radius. Default: `undefined` */
  radius?: number;
  /** Arc width in pixels. Set to `0` if you want to have a pie chart. Default: `20` */
  arcWidth?: number;
  /** Central label accessor function or text. Default: `undefined` */
  centralLabel?: string;
}

export class DonutConfig<Datum> extends ComponentConfig implements DonutConfigInterface<Datum> {
  value = undefined
  angleRange: [number, number] = [0, 2 * Math.PI]
  padAngle = 0
  sortFunction = undefined
  cornerRadius = 0
  color = undefined
  radius = undefined
  arcWidth = 20
  centralLabel = undefined
}
