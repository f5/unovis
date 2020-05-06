// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { ComponentCore } from 'core/component'

// Types
import { Position } from 'types/position'

export interface TooltipConfigInterface<T extends ComponentCore<any>, Datum = any> {
    /** Visualization Components */
    components?: T[];
    horizontalPlacement?: Position | string | undefined;
    verticalPlacement?: Position | string | undefined;
    triggers?: {
      [selector: string]: (data: Datum, i: number, elements: any) => any;
    };
}

export class TooltipConfig<T extends ComponentCore<any>, Datum = any> extends Config implements TooltipConfigInterface<T, Datum> {
  components: T[] = []
  horizontalPlacement = Position.CENTER
  verticalPlacement = Position.TOP
  triggers: {
    [selector: string]: (data: Datum, i: number, elements: any) => any;
  } = {}
}
