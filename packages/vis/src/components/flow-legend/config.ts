// Copyright (c) Volterra, Inc. All rights reserved.

import { Config } from 'core/config'

export interface FlowLegendConfigInterface {
  /** Custom width */
  customWidth?: number;
  /** Legend items array [] */
  items?: string[];
  /** Color of flow line */
  lineColor?: string;
  /** Color of labels */
  labelColor?: string;
  /** Font size of labels in pixels */
  labelFontSize?: number;
  /** Arrow symbol */
  arrowSymbol?: string;
}

export class FlowLegendConfig extends Config implements FlowLegendConfigInterface {
  customWidth = undefined
  items = []
  labelFontSize = 12
  arrowSymbol = '▶'
  lineColor = undefined
  labelColor = undefined
}
