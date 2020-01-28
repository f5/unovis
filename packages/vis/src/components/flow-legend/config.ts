// Copyright (c) Volterra, Inc. All rights reserved.

import { Config } from 'core/config'

export interface FlowLegendConfigInterface {
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
  items = []
  labelFontSize = 12
  arrowSymbol = '▶'
  lineColor = undefined
  labelColor = undefined
}
