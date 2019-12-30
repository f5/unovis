// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { ComponentCore } from 'core/component'

export interface TooltipConfigInterface<T extends ComponentCore> {
    /** Visualization Components */
    components?: T[];
    triggers?: object;
}

export class TooltipConfig<T extends ComponentCore> extends Config implements TooltipConfigInterface<T> {
  components: T[] = []
  triggers = {}
}
