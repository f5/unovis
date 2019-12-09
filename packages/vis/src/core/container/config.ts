// Copyright (c) Volterra, Inc. All rights reserved.
import _merge from 'lodash/merge'
import _isPlainObject from 'lodash/isPlainObject'

export interface ContainerConfigInterface {
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export class ContainerConfig implements ContainerConfigInterface {
  margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  init (config: ContainerConfigInterface = {}): ContainerConfig {
    Object.keys(config).forEach(key => {
      if (_isPlainObject(this[key])) this[key] = _merge(this[key], config[key])
      else this[key] = config[key]
    })

    return this
  }
}
