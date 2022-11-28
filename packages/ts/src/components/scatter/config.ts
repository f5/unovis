import { ScalePower } from 'd3-scale'
// Core
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { Scale, ContinuousScale } from 'types/scale'
import { SymbolType } from 'types/symbol'
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { Position } from 'types/position'

export interface ScatterConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /**
   * Size of the scatter plot marker (e.g. diameter if `SymbolType.Circle` is used for `shape`) in pixels.
   * Can be a constant value or an accessor function. But if `sizeRange` is set, then the values will be treated
   * as an input to `sizeScale`, and the resulting size will be different.
   * Default: `10`
  */
  size?: NumericAccessor<Datum>;
  /** Size scale to be used if the `sizeRange` was set. Default: `Scale.scaleSqrt()` */
  sizeScale?: ContinuousScale;
  /** Size range in the format of `[number, number]` to rescale the input values. Default: `undefined` */
  sizeRange?: [number, number];
  /** Shape of the scatter point. Accessor function or constant value: `SymbolType.Circle`, `SymbolType.Cross`, `SymbolType.Diamond`, `SymbolType.Square`,
   * `SymbolType.Star`, `SymbolType.Triangle` or `SymbolType.Wye`.
   * Default: `SymbolType.Circle` */
  shape?: ((d: Datum, i?: number, ...any) => (SymbolType | string)) | SymbolType | string;
  /** Label accessor function or string. Default: `undefined` */
  label?: StringAccessor<Datum>;
  /** Label color. Default: `undefined` */
  labelColor?: ColorAccessor<Datum>;
  /** Optional point cursor. Default: `null` */
  cursor?: StringAccessor<Datum>;
  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  labelTextBrightnessRatio?: number;
  /** Label position. Default: `Position.Center` */
  labelPosition?: GenericAccessor<Position | `${Position}`, Datum>;
}

export class ScatterConfig<Datum> extends XYComponentConfig<Datum> implements ScatterConfigInterface<Datum> {
  size = 10
  sizeScale: ScalePower<number, number> = Scale.scaleSqrt()
  sizeRange = undefined
  shape = SymbolType.Circle
  label = undefined
  labelColor = undefined
  labelPosition = Position.Bottom
  cursor = null
  labelTextBrightnessRatio = 0.65
}
