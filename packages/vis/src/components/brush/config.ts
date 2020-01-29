// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { BaseEvent } from 'd3-selection'
import { XYComponentConfigInterface, XYComponentConfig } from 'core/xy-component/config'

export interface BrushConfigInterface<Datum> extends XYComponentConfigInterface<Datum> {
  onBrush?: ((selection?: number[], event?: BaseEvent) => any);
  onBrushStart?: ((selection?: number[], event?: BaseEvent) => any);
  onBrushMove?: ((selection?: number[], event?: BaseEvent) => any);
  onBrushEnd?: ((selection?: number[], event?: BaseEvent) => any);
  /** Width of the brush handle */
  handleWidth?: number;
  /** Selection is the actual value units: [start, end] */
  selection?: number[] | null;
  /** Allow dragging the selected area in order to change the selected range */
  draggable: boolean;
}

export class BrushConfig<Datum> extends XYComponentConfig<Datum> implements BrushConfigInterface<Datum> {
  onBrush = (s: number[], e: BaseEvent) => {}
  onBrushStart = (s: number[], e: BaseEvent) => {}
  onBrushMove = (s: number[], e: BaseEvent) => {}
  onBrushEnd = (s: number[], e: BaseEvent) => {}
  handleWidth = 9
  selection = null
  draggable = false
}
