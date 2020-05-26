// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { SymbolType } from 'types/symbols'
import { NumericAccessor } from 'types/misc'

export interface ScatterConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Size accessor function or value in pixels */
  size?: NumericAccessor<Datum>;
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye */
  shape?: ((d: Datum, i?: number, ...any) => SymbolType) | SymbolType;
  /** Icon */
  icon?: ((d: Datum, i?: number, ...any) => string) | string;
}

export class ScatterConfig<Datum> extends XYComponentConfig<Datum> implements ScatterConfigInterface<Datum> {
  size = 10
  shape = SymbolType.CIRCLE
  icon = undefined
}
