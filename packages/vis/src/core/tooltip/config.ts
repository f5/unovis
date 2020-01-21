// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { ComponentCore } from 'core/component'

export interface TooltipConfigInterface<T extends ComponentCore<any>, TooltipDatum = any> {
    /** Visualization Components */
    components?: T[];
    triggers?: {
      [selector: string]: (data: TooltipDatum, i: number, elements: any) => any;
    };
}

export class TooltipConfig<T extends ComponentCore<any>, TooltipDatum = any> extends Config implements TooltipConfigInterface<T, TooltipDatum> {
  components: T[] = []
  triggers: {
    [selector: string]: (data: TooltipDatum, i: number, elements: any) => any;
  } = {}
}
