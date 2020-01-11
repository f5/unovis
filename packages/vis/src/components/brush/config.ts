// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { BaseEvent } from 'd3-selection'
import { XYConfigInterface, XYConfig } from 'core/xy-component/config'

export interface BrushConfigInterface extends XYConfigInterface {
  onBrushStart?: ((selection?: number[], event?: BaseEvent) => any);
  onBrushMove?: ((selection?: number[], event?: BaseEvent) => any);
  onBrushEnd?: ((selection?: number[], event?: BaseEvent) => any);
  handleWidth?: number;
  selection?: number[] | null;
}

export class BrushConfig extends XYConfig implements BrushConfigInterface {
  onBrushStart = (s: number[], e: BaseEvent) => {}
  onBrushMove = (s: number[], e: BaseEvent) => {}
  onBrushEnd = (s: number[], e: BaseEvent) => {}
  handleWidth = 9
  selection = null
}
