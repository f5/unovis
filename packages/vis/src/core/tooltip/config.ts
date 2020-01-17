// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { ComponentCore } from 'core/component'

export interface TooltipConfigInterface<T extends ComponentCore<any>, TooltipData = any> {
    /** Visualization Components */
    components?: T[];
    triggers?: {
      [className: string]: (data: TooltipData, i: number, elements: any) => any;
    };
}

export class TooltipConfig<T extends ComponentCore<any>, TooltipData = any> extends Config implements TooltipConfigInterface<T, TooltipData> {
  components: T[] = []
  triggers: {
    [className: string]: (data: TooltipData, i: number, elements: any) => any;
  } = {}
}
