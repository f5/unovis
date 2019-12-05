// Copyright (c) Volterra, Inc. All rights reserved.
import _merge from 'lodash/merge'
import _isPlainObject from 'lodash/isPlainObject'

export interface ComponentConfigInterface {
  duration?: number;
  width?: number;
  height?: number;
}

export class ComponentConfig implements ComponentConfigInterface {
  duration = 600
  width = 400
  height = 200

  init (config: ComponentConfigInterface = {}): ComponentConfig {
    Object.keys(config).forEach(key => {
      if (_isPlainObject(this[key])) this[key] = _merge(this[key], config[key])
      else this[key] = config[key]
    })

    return this
  }
}

export interface ConfigConstructor {
  new(config?: ComponentConfigInterface): ComponentConfig;
}
