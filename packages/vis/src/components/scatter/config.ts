// Copyright (c) Volterra, Inc. All rights reserved.
// Core
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { NumericAccessor, StringAccessor } from 'types/misc'
import { Scale, ContiniousScale } from 'types/scales'
import { SymbolType } from 'types/symbols'

export interface ScatterConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Single Y accessor function or constant value */
  y?: NumericAccessor<Datum>;
  /** Size accessor function or value in relative units. Default: `1` */
  size?: NumericAccessor<Datum>;
  /** Size Scale. Default: `Scale.scaleLinear()` */
  sizeScale?: ContiniousScale;
  /** Size Range, [number, number]. Default: `[5, 20]` */
  sizeRange?: [number, number];
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye. Default: `SymbolType.CIRCLE` */
  shape?: ((d: Datum, i?: number, ...any) => SymbolType) | SymbolType;
  /** Icon */
  icon?: ((d: Datum, i?: number, ...any) => string) | string;
  /** Optional point cursor. Default: `null` */
  cursor?: StringAccessor<Datum>;
}

export class ScatterConfig<Datum> extends XYComponentConfig<Datum> implements ScatterConfigInterface<Datum> {
  size = 1
  sizeScale = Scale.scaleLinear()
  sizeRange: [number, number] = [5, 20]
  shape = SymbolType.CIRCLE
  icon = undefined
  cursor = null
}
