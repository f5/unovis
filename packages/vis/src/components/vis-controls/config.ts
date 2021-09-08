// Copyright (c) Volterra, Inc. All rights reserved.
import { Config } from 'core/config'

// Local Types
import { VisControlItemInterface, VisControlsOrientation } from './types'

export interface VisControlsConfigInterface {
  /** Controls items array, VisControlItemInterface[]. Default: `[]` */
  items?: VisControlItemInterface[];
  /** Controls orientation. `VisControlsOrientation.Horizontal` or `VisControlsOrientation.Horizontal`. Default: `VisControlsOrientation.Horizontal` */
  orientation?: VisControlsOrientation;
}

export class VisControlsConfig extends Config implements VisControlsConfigInterface {
  items = []
  orientation = VisControlsOrientation.Horizontal
}
