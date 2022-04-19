import { ScaleLinear } from 'd3-scale'
// Core
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { Scale, ContinuousScale } from 'types/scale'
import { SymbolType } from 'types/symbol'
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

export interface ScatterConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Single Y accessor function. Default: `undefined` */
  y: NumericAccessor<Datum>;
  /** Size accessor function or constant value in relative units. Default: `1` */
  size?: NumericAccessor<Datum>;
  /** Size scale. Default: `Scale.scaleLinear()` */
  sizeScale?: ContinuousScale;
  /** Size Range, [number, number]. Default: `[5, 20]` */
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
