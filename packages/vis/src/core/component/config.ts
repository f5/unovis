// Copyright (c) Volterra, Inc. All rights reserved.
import { isPlainObject, merge} from 'utils/data'

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
      if (isPlainObject(this[key])) this[key] = merge(this[key], config[key])
      else this[key] = config[key]
    })

    return this
  }
}

export interface ConfigConstructor {
  new(config?: ComponentConfigInterface): ComponentConfig;
}
