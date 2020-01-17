// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { SymbolType } from 'types/symbols'
import { NumericAccessor } from 'types/misc'

export interface ScatterConfigInterface<Data> extends XYComponentConfigInterface<Data> {
  /** Size accessor function or value in pixels */
  size?: NumericAccessor<Data>;
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye */
  shape?: ((d: Data, i?: number, ...any) => SymbolType) | SymbolType;
  /** Icon */
  icon?: ((d: Data, i?: number, ...any) => string) | string;
}

export class ScatterConfig<Data> extends XYComponentConfig<Data> implements ScatterConfigInterface<Data> {
  size = 10
  shape = SymbolType.CIRCLE
  icon = undefined
}
