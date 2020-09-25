// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { ComponentCore } from 'core/component'

// Types
import { Position } from 'types/position'

export interface TooltipConfigInterface<T extends ComponentCore<any>, Datum = any> {
    /** Visualization Components */
    components?: T[];
    container?: HTMLElement;
    horizontalPlacement?: Position | string | undefined;
    horizontalShift?: number;
    verticalPlacement?: Position | string | undefined;
    verticalShift?: number;
    triggers?: {
      [selector: string]: (data: Datum, i: number, elements: any) => any;
    };
}

export class TooltipConfig<T extends ComponentCore<any>, Datum = any> extends Config implements TooltipConfigInterface<T, Datum> {
  components: T[] = []
  container = undefined
  horizontalPlacement = Position.AUTO
  horizontalShift = 0
  verticalPlacement = Position.TOP
  verticalShift = 0
  triggers: {
    [selector: string]: (data: Datum, i: number, elements: any) => any;
  } = {}
}
