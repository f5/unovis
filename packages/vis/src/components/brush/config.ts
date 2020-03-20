// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { BaseEvent } from 'd3-selection'
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

// Types
import { Arrangement } from 'types/position'

export interface BrushConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  onBrush?: ((selection?: number[], event?: BaseEvent, userDriven?: boolean) => any);
  onBrushStart?: ((selection?: number[], event?: BaseEvent, userDriven?: boolean) => any);
  onBrushMove?: ((selection?: number[], event?: BaseEvent, userDriven?: boolean) => any);
  onBrushEnd?: ((selection?: number[], event?: BaseEvent, userDriven?: boolean) => any);
  /** Width of the brush handle */
  handleWidth?: number;
  /** Selection is the actual value units: [start, end] */
  selection?: [number, number] | null;
  /** Allow dragging the selected area in order to change the selected range */
  draggable?: boolean;
  /** Position of the handle: 'inside' or 'outside' */
  handlePosition?: Arrangement | string;
}

export class BrushConfig<Datum> extends XYComponentConfig<Datum> implements BrushConfigInterface<Datum> {
  onBrush = (s: number[], e: BaseEvent, userDriven: boolean) => {}
  onBrushStart = (s: number[], e: BaseEvent, userDriven: boolean) => {}
  onBrushMove = (s: number[], e: BaseEvent, userDriven: boolean) => {}
  onBrushEnd = (s: number[], e: BaseEvent, userDriven: boolean) => {}
  handleWidth = 9
  selection = null
  draggable = false
  handlePosition: Arrangement | string = Arrangement.INSIDE
}
