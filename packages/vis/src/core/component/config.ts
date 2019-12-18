// Copyright (c) Volterra, Inc. All rights reserved.
import { isPlainObject, merge } from 'utils/data'

export interface ComponentConfigInterface {
  /** Animation duration */
  duration?: number;
  /** Component width in pixels */
  width?: number;
  /** Component height in pixels */
  height?: number;
  /** Events */
  events?: object;
}

export class ComponentConfig implements ComponentConfigInterface {
  duration = 600
  width = 400
  height = 200
  events = {}

  init (config: ComponentConfigInterface = {}): ComponentConfig {
    Object.keys(config).forEach(key => {
      if (isPlainObject(this[key])) this[key] = merge(this[key], config[key])
      else this[key] = config[key]
    })

    return this
  }
}

export interface ConfigConstructor {
  new(config?: ComponentConfigInterface): ComponentConfig;
}
