// Copyright (c) Volterra, Inc. All rights reserved.
import { ScaleLinear } from 'd3-scale'
// Core
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { Scale, ContinuousScale } from 'types/scale'
import { SymbolType } from 'types/symbol'
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

export interface ScatterConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Single Y accessor function or constant value */
  y?: NumericAccessor<Datum>;
  /** Size accessor function or value in relative units. Default: `1` */
  size?: NumericAccessor<Datum>;
  /** Size Scale. Default: `Scale.scaleLinear()` */
  sizeScale?: ContinuousScale;
  /** Size Range, [number, number]. Default: `[5, 20]` */
  sizeRange?: [number, number];
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye. Default: `SymbolType.Circle` */
  shape?: ((d: Datum, i?: number, ...any) => SymbolType) | SymbolType;
  /** Label accessor function or string. Default: `undefined` */
  label?: StringAccessor<Datum>;
  /** Label color. Default: `undefined` */
  labelColor?: ColorAccessor<Datum>;
  /** Optional point cursor. Default: `null` */
  cursor?: StringAccessor<Datum>;
  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  labelTextBrightnessRatio?: number;
}

export class ScatterConfig<Datum> extends XYComponentConfig<Datum> implements ScatterConfigInterface<Datum> {
  size = 1
  sizeScale: ScaleLinear<number, number> = Scale.scaleLinear()
  sizeRange: [number, number] = [5, 20]
  shape = SymbolType.Circle
  label = undefined
  labelColor = undefined
  cursor = null
  labelTextBrightnessRatio = 0.65
}
