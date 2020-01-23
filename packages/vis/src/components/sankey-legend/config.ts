// Copyright (c) Volterra, Inc. All rights reserved.

import { Config } from 'core/config'

// Types
import { Margin } from 'types/misc'

export interface SankeyLegendConfigInterface {
  /** Legend items array [] */
  items?: string[];
  margin?: Margin;
}

export class SankeyLegendConfig extends Config implements SankeyLegendConfigInterface {
  items = []
  margin = {
    left: 0,
    right: 0,
  }
}
