// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'

export interface TooltipConfigInterface {
    /** Visualization Component */
    component?: any;
    elements?: object;
}

export class TooltipConfig extends Config implements TooltipConfigInterface {
  component = undefined
  elements = {}
}
