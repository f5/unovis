// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { NumericAccessor, StringAccessor } from 'types/misc'
import { SymbolType } from 'types/symbols'

export interface ScatterConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  /** Size accessor function or value in pixels */
  size?: NumericAccessor<Datum>;
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye */
  shape?: ((d: Datum, i?: number, ...any) => SymbolType) | SymbolType;
  /** Icon */
  icon?: ((d: Datum, i?: number, ...any) => string) | string;
  /** Optional point cursor. Default: `null` */
  cursor?: StringAccessor<Datum>;
}

export class ScatterConfig<Datum> extends XYComponentConfig<Datum> implements ScatterConfigInterface<Datum> {
  size = 10
  shape = SymbolType.CIRCLE
  icon = undefined
  cursor = null
}
