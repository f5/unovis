// Copyright (c) Volterra, Inc. All rights reserved.
import { isPlainObject, merge } from 'utils/data'

export interface ContainerConfigInterface {
  /** Container margins */
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Chart padding */
  padding?: {
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

  padding = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }

  init (config: ContainerConfigInterface = {}): ContainerConfig {
    Object.keys(config).forEach(key => {
      if (isPlainObject(this[key])) this[key] = merge(this[key], config[key])
      else this[key] = config[key]
    })

    return this
  }
}
