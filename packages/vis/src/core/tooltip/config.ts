// Copyright (c) Volterra, Inc. All rights reserved.
import { isPlainObject, merge} from 'utils/data'

export interface TooltipConfigInterface {
    /** Visualization Component */
    component?: any;
    elements?: object;
}

export class TooltipConfig implements TooltipConfigInterface {
  component = undefined
  elements = {}

  init (config: TooltipConfigInterface = {}): TooltipConfig {
    Object.keys(config).forEach(key => {
      if (isPlainObject(this[key])) this[key] = merge(this[key], config[key])
      else this[key] = config[key]
    })

    return this
  }
}
