// Copyright (c) Volterra, Inc. All rights reserved.
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'
import { SymbolType } from 'types/symbols'
import { NumericAccessor } from 'types/misc'

export interface ScatterConfigInterface extends XYComponentConfigInterface {
  /** Size accessor function or value in pixels */
  size?: NumericAccessor;
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye */
  shape?: ((d: any, i?: number, ...any) => SymbolType) | SymbolType;
  /** Icon */
  icon?: ((d: any, i?: number, ...any) => string) | string;
}

export class ScatterConfig extends XYComponentConfig implements ScatterConfigInterface {
  size = 10
  shape = SymbolType.CIRCLE
  icon = undefined
}
