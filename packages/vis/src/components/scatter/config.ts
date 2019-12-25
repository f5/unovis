// Copyright (c) Volterra, Inc. All rights reserved.
import { XYConfigInterface, XYConfig } from 'core/xy-component/config'

export interface ScatterConfigInterface extends XYConfigInterface {
  /** Size accessor function or value in pixels */
  size?: number | Function
  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye */
  shape?: string | Function
  /** Icon */
  icon?: string | Function
}

export class ScatterConfig extends XYConfig implements ScatterConfigInterface {
  size = 10
  shape = 'circle'
  icon = undefined
}
