// Copyright (c) Volterra, Inc. All rights reserved.
import { BaseEvent } from 'd3-selection'
import { XYConfigInterface, XYConfig } from 'core/xy-component/config'

export interface BrushConfigInterface extends XYConfigInterface {
  onBrush?: ((selection?: number[], event?: BaseEvent) => any);
  handleWidth?: number;
  selection?: number[] | null;
}

export class BrushConfig extends XYConfig implements BrushConfigInterface {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onBrush = (s: number[], e: BaseEvent) => {}
  handleWidth = 9
  selection = null
}
