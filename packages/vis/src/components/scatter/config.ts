// Copyright (c) Volterra, Inc. All rights reserved.
import { XYConfigInterface, XYConfig } from 'core/xy-component/config'
import { SymbolType } from 'enums/symbols'
import { NumericAccessor } from 'utils/types'

export interface ScatterConfigInterface extends XYConfigInterface {
  /** Size accessor function or value in pixels */
  size?: NumericAccessor;
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye */
  shape?: ((d: any, i?: number, ...any) => SymbolType) | SymbolType;
  /** Icon */
  icon?: ((d: any, i?: number, ...any) => string) | string;
}

export class ScatterConfig extends XYConfig implements ScatterConfigInterface {
  size = 10
  shape = SymbolType.CIRCLE
  icon = undefined
}
