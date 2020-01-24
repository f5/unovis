// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'
import { ComponentCore } from 'core/component'

// Types
import { Position } from 'types/position'

export interface TooltipConfigInterface<T extends ComponentCore<any>, TooltipDatum = any> {
    /** Visualization Components */
    components?: T[];
    horizontalPlacement?: Position | undefined;
    verticalPlacement?: Position | undefined;
    triggers?: {
      [selector: string]: (data: {data: TooltipDatum}, i: number, elements: any) => any;
    };
}

export class TooltipConfig<T extends ComponentCore<any>, TooltipDatum = any> extends Config implements TooltipConfigInterface<T, TooltipDatum> {
  components: T[] = []
  horizontalPlacement = Position.CENTER
  verticalPlacement = Position.TOP
  triggers: {
    [selector: string]: (data: {data: TooltipDatum}, i: number, elements: any) => any;
  } = {}
}
